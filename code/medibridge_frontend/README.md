# MediBridge Frontend

This is the frontend part of my MediBridge project. It's a digital healthcare platform that I built to match the project wireframes. 

It has three separate portals using role-based routing: Patient, Doctor, and Admin.

**Tech Stack:**
- React (bootstrapped with Vite)
- Redux Toolkit for state management
- React Router DOM
- Bootstrap 5 for styling
- Axios for API calls

## Getting Started

To run this locally, just install the dependencies and start the dev server:

```bash
npm install
npm run dev
```
Then open http://localhost:5173 in your browser.

**Note on testing:** I set it up with mock data enabled by default so you don't even need the backend running to click around the UI. You can just put in any fake email/password on the login screen to test out the different roles.

## Connecting to Backend

Once the Spring Boot backend is up and running, you just need to update the `.env` file to point to it:

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_USE_MOCK=false
```

Setting `VITE_USE_MOCK=false` will make all the API services in `src/services/` start hitting the real endpoints instead of returning the hardcoded mock data. The JWT token also gets attached automatically to the request headers by the Axios interceptor I set up in `src/api/axiosClient.js`.

### Expected API Endpoints
If you are running the backend alongside this, these are the main endpoints the frontend expects to hit:
- `POST /auth/login` (needs email, password, role)
- `POST /auth/register/patient`
- `POST /auth/register/doctor`
- `GET /doctors`
- `GET /specialties`
- `GET /appointments/patient`
- `POST /appointments`
- `PATCH /appointments/{id}/cancel`
- `GET /appointments/doctor/dashboard`
- `GET /records`
- `POST /records`
- And various `/admin/*` routes for the admin dashboard.

## Folder Structure

Here's a quick overview of how I organized the `src` folder:
- `api/`: The axios client setup
- `app/`: Redux store config
- `features/`: All the Redux slices (auth, doctors, appointments, etc.)
- `services/`: API call functions (with the logic to switch between real and mock data)
- `components/`: 
  - `common/`: Reusable UI bits like buttons, cards, and inputs
  - `layout/`: Navbars, sidebars, and page wrappers
- `pages/`: Grouped by portal (public, patient, doctor, admin)
- `routes/`: Where all the React Router logic and role protection lives

## Building for Production

To build the project for deployment:
```bash
npm run build
```
