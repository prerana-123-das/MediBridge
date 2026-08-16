package com.medibridge.core;

import com.google.api.client.auth.oauth2.Credential;
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

import java.io.File;
import java.util.Collections;
import java.util.UUID;

public class TestCalendar {
    public static void main(String[] args) {
        try {
            JsonFactory JSON_FACTORY = GsonFactory.getDefaultInstance();
            NetHttpTransport httpTransport = GoogleNetHttpTransport.newTrustedTransport();
            
            // Client ID and Secret from application.yml
            String clientId = "741957729487-p8l7sbvq7dkh3174uotrl6p5mmteftie.apps.googleusercontent.com";
            String clientSecret = "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";
            
            GoogleAuthorizationCodeFlow flow = new GoogleAuthorizationCodeFlow.Builder(
                    httpTransport, JSON_FACTORY, clientId, clientSecret, Collections.singletonList(CalendarScopes.CALENDAR_EVENTS))
                    .setDataStoreFactory(new FileDataStoreFactory(new File("tokens")))
                    .setAccessType("offline")
                    .build();

            Credential credential = flow.loadCredential("doctor_91670851-400a-4ae3-afe9-ffaa892c358d");
            if (credential == null) {
                System.out.println("Credential is NULL!");
                return;
            }
            
            System.out.println("Credential loaded successfully!");
            System.out.println("Access Token: " + credential.getAccessToken());
            
            Calendar service = new Calendar.Builder(httpTransport, JSON_FACTORY, credential)
                    .setApplicationName("MediBridge Core")
                    .build();

            Event event = new Event()
                    .setSummary("Test Consultation")
                    .setDescription("Reason: Test");

            EventAttendee doctorAttendee = new EventAttendee().setEmail("rutujalikhar2003@gmail.com");
            EventAttendee patientAttendee = new EventAttendee().setEmail("adarsh@gmail.com");
            event.setAttendees(java.util.Arrays.asList(doctorAttendee, patientAttendee));
            event.setGuestsCanModify(true);

            java.time.ZonedDateTime startZdt = java.time.ZonedDateTime.now().plusHours(1);
            java.time.ZonedDateTime endZdt = startZdt.plusHours(1);

            DateTime startDateTime = new DateTime(startZdt.toInstant().toEpochMilli());
            EventDateTime start = new EventDateTime().setDateTime(startDateTime).setTimeZone(java.time.ZoneId.systemDefault().getId());
            event.setStart(start);

            DateTime endDateTime = new DateTime(endZdt.toInstant().toEpochMilli());
            EventDateTime end = new EventDateTime().setDateTime(endDateTime).setTimeZone(java.time.ZoneId.systemDefault().getId());
            event.setEnd(end);

            ConferenceSolutionKey conferenceSKey = new ConferenceSolutionKey().setType("hangoutsMeet");
            CreateConferenceRequest createConferenceReq = new CreateConferenceRequest()
                    .setRequestId(UUID.randomUUID().toString())
                    .setConferenceSolutionKey(conferenceSKey);
            ConferenceData conferenceData = new ConferenceData().setCreateRequest(createConferenceReq);
            event.setConferenceData(conferenceData);

            System.out.println("Inserting event...");
            Event createdEvent = service.events().insert("primary", event)
                    .setConferenceDataVersion(1)
                    .execute();

            if (createdEvent.getConferenceData() != null &&
                createdEvent.getConferenceData().getEntryPoints() != null) {
                for (EntryPoint ep : createdEvent.getConferenceData().getEntryPoints()) {
                    if ("video".equals(ep.getEntryPointType())) {
                        System.out.println("SUCCESS! Meet Link: " + ep.getUri());
                        return;
                    }
                }
            }
            System.out.println("Event created but no video entry point found.");
            
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
