package com.medibridge.core.service;

import com.google.api.client.auth.oauth2.AuthorizationCodeRequestUrl;
import com.google.api.client.auth.oauth2.Credential;
import com.google.api.client.auth.oauth2.TokenResponse;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeFlow;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.client.util.DateTime;
import com.google.api.client.util.store.FileDataStoreFactory;
import com.google.api.services.calendar.Calendar;
import com.google.api.services.calendar.CalendarScopes;
import com.google.api.services.calendar.model.*;
import com.medibridge.core.model.Appointment;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.io.File;
import java.io.IOException;
import java.time.ZoneId;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Service
@Slf4j
public class GoogleCalendarService {

    @Value("${google.client.id}")
    private String clientId;

    @Value("${google.client.secret}")
    private String clientSecret;

    @Value("${google.redirect.uri}")
    private String redirectUri;

    private static final String APPLICATION_NAME = "MediBridge Core";
    private static final JsonFactory JSON_FACTORY = GsonFactory.getDefaultInstance();
    private static final String TOKENS_DIRECTORY_PATH = "tokens";
    private static final List<String> SCOPES = Collections.singletonList(CalendarScopes.CALENDAR_EVENTS);

    private NetHttpTransport httpTransport;
    private GoogleAuthorizationCodeFlow flow;

    @PostConstruct
    public void init() {
        try {
            httpTransport = GoogleNetHttpTransport.newTrustedTransport();
            flow = new GoogleAuthorizationCodeFlow.Builder(
                    httpTransport, JSON_FACTORY, clientId, clientSecret, SCOPES)
                    .setDataStoreFactory(new FileDataStoreFactory(new File(TOKENS_DIRECTORY_PATH)))
                    .setAccessType("offline")
                    .build();
        } catch (Exception e) {
            log.error("Failed to initialize GoogleCalendarService", e);
        }
    }

    /**
     * Generates the URL for the user to authorize the application.
     */
    public String getAuthorizationUrl(String doctorId) {
        AuthorizationCodeRequestUrl authorizationUrl = flow.newAuthorizationUrl().setRedirectUri(redirectUri).setState(doctorId);
        return authorizationUrl.build();
    }

    /**
     * Exchanges the authorization code for tokens and stores them.
     */
    public void exchangeCodeForTokens(String code, String doctorId) throws IOException {
        TokenResponse response = flow.newTokenRequest(code).setRedirectUri(redirectUri).execute();
        flow.createAndStoreCredential(response, "doctor_" + doctorId);
        log.info("Google Calendar tokens stored successfully for Doctor ID: " + doctorId);
    }

    /**
     * Retrieves the stored credential.
     */
    private Credential getCredential(String doctorId) throws IOException {
        Credential credential = flow.loadCredential("doctor_" + doctorId);
        if (credential == null) {
            log.warn("No Google credential found for Doctor ID: " + doctorId + ". Doctor needs to authenticate.");
        }
        return credential;
    }

    /**
     * Creates a Google Meet link for the given appointment.
     */
    public String createMeetLink(Appointment appointment) {
        try {
            Credential credential = getCredential(appointment.getDoctor().getDoctorId());
            if (credential == null) {
                return null;
            }

            Calendar service = new Calendar.Builder(httpTransport, JSON_FACTORY, credential)
                    .setApplicationName(APPLICATION_NAME)
                    .build();

            Event event = new Event()
                    .setSummary("Consultation: " + appointment.getDoctor().getFullName() + " & " + appointment.getPatient().getFullName())
                    .setDescription("Reason: " + appointment.getReason());

            // Add attendees so they can join directly without host permission
            EventAttendee doctorAttendee = new EventAttendee().setEmail(appointment.getDoctor().getEmail());
            EventAttendee patientAttendee = new EventAttendee().setEmail(appointment.getPatient().getEmail());
            event.setAttendees(java.util.Arrays.asList(doctorAttendee, patientAttendee));
            event.setGuestsCanModify(true);

            // Set start and end times
            java.time.LocalDateTime startLdt = appointment.getAppointmentDate();
            if (startLdt == null) return null;
            java.time.ZonedDateTime startZdt = startLdt.atZone(ZoneId.systemDefault());
            java.time.ZonedDateTime endZdt = startZdt.plusHours(1);

            DateTime startDateTime = new DateTime(startZdt.toInstant().toEpochMilli());
            EventDateTime start = new EventDateTime().setDateTime(startDateTime).setTimeZone(ZoneId.systemDefault().getId());
            event.setStart(start);

            DateTime endDateTime = new DateTime(endZdt.toInstant().toEpochMilli());
            EventDateTime end = new EventDateTime().setDateTime(endDateTime).setTimeZone(ZoneId.systemDefault().getId());
            event.setEnd(end);

            // Add Meet Conference Data
            ConferenceSolutionKey conferenceSKey = new ConferenceSolutionKey().setType("hangoutsMeet");
            CreateConferenceRequest createConferenceReq = new CreateConferenceRequest()
                    .setRequestId(UUID.randomUUID().toString())
                    .setConferenceSolutionKey(conferenceSKey);
            ConferenceData conferenceData = new ConferenceData().setCreateRequest(createConferenceReq);
            event.setConferenceData(conferenceData);

            // Insert Event
            Event createdEvent = service.events().insert("primary", event)
                    .setConferenceDataVersion(1)
                    .execute();

            if (createdEvent.getConferenceData() != null &&
                createdEvent.getConferenceData().getEntryPoints() != null) {
                for (EntryPoint ep : createdEvent.getConferenceData().getEntryPoints()) {
                    if ("video".equals(ep.getEntryPointType())) {
                        return ep.getUri();
                    }
                }
            }

        } catch (Exception e) {
            log.error("Failed to create Google Meet link", e);
        }
        return null;
    }
}
