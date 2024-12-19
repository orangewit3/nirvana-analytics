# Design Document for MongoDB Integration

Below is a step-by-step guide and reference for a backend engineer to integrate MongoDB into our existing personal health analytics application. This design document explains the main data flow changes, recommended schema design, and how to store and retrieve both the user's health data (as per the "HealthDataInputSchema") and the resulting health analysis (as per the "HealthAnalysisSchema").

## 1. Overview of Requirements

1. Store the user's health data ("HealthDataInput" object) in MongoDB when the user submits the form.
2. Store the resulting health analysis ("HealthAnalysisSchema" object) in MongoDB after the /analyze endpoint processes it.  
3. Instead of relying on local browser caching (localStorage), retrieve the stored "HealthAnalysisSchema" object from MongoDB on the results page. This avoids repeated calls to the /analyze endpoint and makes the data persistent across sessions.  
4. Ensure that data is associated with a user identifier (e.g., "userID", "patientID", or both) so future retrieval is tied to the specific user.

## 2. Proposed Database Setup

Depending on your hosting and deployment strategy, you can either use a Mongo cluster or a local instance. In most production settings, you'd likely have:

- A single MongoDB database named, for example, "nirvanaAnalytics".
- Two main collections:
  1. **healthDataInputs**  
     Stores the user's raw input data (based on HealthDataInputSchema).
  2. **healthAnalyses**  
     Stores the structured analysis data (based on HealthAnalysisSchema).

## 3. Collection Schemas

### 3.1 healthDataInputs Collection

Each document could look like this conceptually (pseudocode):

- userId (ObjectId/string) – references the user account or unique ID from your authentication system.  
- patientId (string) – a unique ID or reference used in the existing code (currently generated via nanoid).  
- name (string) – the user's name if required.  
- dateOfBirth (Date) – user's DOB.  
- age (number) – derived from dateOfBirth or input.  
- sex (string) – e.g., "M" or "F".  
- height (number) – user's height in centimeters.  
- weight (number) – user's weight in kilograms.  
- address (object) – area: string enum from JAKARTA_AREAS, otherArea: optional string.  
- bloodPressure (object) – systolic, diastolic (both optional).  
- chronicConditions (array of strings) – from CHRONIC_CONDITIONS.  
- otherChronicCondition (string) – optional.  
- allergies (string) – optional.  
- bloodReportText (string) – text extracted from uploaded PDF.  
- createdAt (Date) – defaults to current date/time.

Note: This design matches or extends your existing "HealthDataInputSchema". Validate carefully to ensure consistency with the app's form data.

### 3.2 healthAnalyses Collection

Each document could look like this conceptually:

```json
{
  "userId": "(ObjectId/string)", // references the user account or unique ID
  "patientId": "string", // must match the patientId stored in healthDataInputs
  "analysis": {
    "overallHealthScore": {
      "score": "number",
      "scoringSystem": "string",
      "explanation": "string"
    },
    "cholesterolLevels": {
      "score": "number",
      "scoringSystem": "string",
      "explanation": "string"
    }
    // ... other categories per HealthAnalysisSchema ...
  },
  "createdAt": "Date" // defaults to current date/time
}
```

## 4. Backend Integration Changes

### 4.1 When the User Submits the Form

1. The frontend currently calls an endpoint (e.g., /api/analyze) with body data derived from HealthDataInputSchema.  
2. Instead of storing that data just in localStorage, the backend should:  
   - Parse the request.  
   - Insert the user's health data into the **healthDataInputs** collection.  
3. Return a success response (e.g., { status: 200 }) or proceed to the analysis in the same step.  

Implementation Detail (conceptual flow):  
a. A user (or patient) fills out the form.  
b. The client calls /api/analyze (POST) with the user's health data and userId/patientId.  
c. The server inserts the document into "healthDataInputs" if it doesn't exist already. (Alternatively, you can do an "upsert" if the user is editing an existing record.)  

### 4.2 Running the Analysis

1. After or during the storage step above, the server calls the OpenAI API to generate the structured "HealthAnalysisSchema" object.  
2. Once the server receives a valid analysis from OpenAI, store it in **healthAnalyses**.  
   - The stored document should reference "userId" and "patientId" so it can be retrieved in the future.

Implementation Detail (conceptual flow):  
a. The server receives the analysis from OpenAI.  
b. Validate it against HealthAnalysisSchema.  
c. Insert the resulting JSON into "healthAnalyses" with the reference to the user/patient.  

### 4.3 Retrieving Data on the Results Page

1. The results page currently depends on localStorage ("healthAnalysis" item).  
2. Instead of reading from localStorage, the results page (client-side) can do a GET request to an endpoint (e.g., /api/results?userId=<...>) or /api/analyze?userId=<...> to retrieve the previously stored analysis.  
3. The server then queries the **healthAnalyses** collection to fetch the user's latest analysis.  
4. The server returns the stored object.  
5. The frontend displays each health metric using the stored analysis data, removing the need for repeated calls to the analyze endpoint.

Advantages:
- Data persists on the server.  
- Refresh or logout/login won't lose the user's analysis.  
- No repeated calls to /analyze are needed unless the user explicitly wants a re-analysis.

## 5. Step-by-Step Data Flow with MongoDB

1. **User Submits Form**  
   Frontend → /api/analyze (POST)  
   - Contains HealthDataInput payload (patientId, name, age, etc.).  

2. **Store User Input**  
   Backend → MongoDB ("healthDataInputs" collection)  
   - Insert or update the document matched by `userId + patientId`.  

3. **OpenAI Analysis**  
   Backend calls OpenAI with the user's data.  
   - Receives a structured result matching HealthAnalysisSchema.  

4. **Store Analysis**  
   Backend → MongoDB ("healthAnalyses" collection)  
   - Insert a new document with userId, patientId, and the full analysis object.  

5. **Display Results**  
   Frontend → /api/results?userId=xxx (GET)  
   - The endpoint fetches from "healthAnalyses" by userId (and possibly patientId if needed).  
   - Returns the JSON object for the user's analysis.  
   - The results page uses this data to display the user's health score widgets and explanations.

## current file structure

.
├── README.md
├── app
│   ├── api
│   │   ├── analyze
│   │   ├── generate-report
│   │   ├── parse-pdf
│   │   ├── pdf
│   │   └── test
│   ├── favicon.ico
│   ├── fonts
│   │   ├── GeistMonoVF.woff
│   │   └── GeistVF.woff
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   └── results
│       └── page.tsx
├── components
│   ├── health-form-fields.tsx
│   ├── health-form.tsx
│   ├── health-score-widget.tsx
│   ├── pdf-upload.tsx
│   └── ui
│       ├── accordion.tsx
│       ├── avatar.tsx
│       ├── badge.tsx
│       ├── button.tsx
│       ├── calendar.tsx
│       ├── card.tsx
│       ├── chart.tsx
│       ├── checkbox.tsx
│       ├── dialog.tsx
│       ├── dropdown-menu.tsx
│       ├── form.tsx
│       ├── hover-card.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── popover.tsx
│       ├── progress.tsx
│       ├── select.tsx
│       ├── separator.tsx
│       ├── slider.tsx
│       ├── tabs.tsx
│       └── tooltip.tsx
├── components.json
├── fonts
├── instructions
│   ├── instructions.md
│   └── mongodb-integration.md
├── lib
│   └── utils.ts
├── next-env.d.ts
├── next.config.mjs
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
└── tsconfig.json

15 directories, 44 files

## 6. Considerations for Authentication and Security

1. **Authentication**  
   - Ensure you have a userID or a session token that associates the user with their database records.  
   - The userId should be included in requests to /api/analyze or /api/results.  
   - If you're using NextAuth or a similar library, pass the user's session info from the backend.  

2. **Authorization**  
   - Verify the requesting user is allowed to access the specified userId's data.  
   - Avoid mismatches where a user could read another user's analysis.  

3. **Input Validation**  
   - The server must validate the request body with Zod (matching HealthDataInputSchema) before inserting to MongoDB.  
   - The server must also validate the OpenAI output with HealthAnalysisSchema before storing it.  

## 7. Summary of Needed Backend Tasks

1. **MongoDB Connection**  
   - Set up a connection pool to MongoDB (e.g., with Mongoose or the native Node MongoDB driver).  
   - Typically done in a shared lib or config file for Next.js (e.g., "lib/db.ts").  

2. **Defining Mongoose Models or Raw Collection Access**  
   - Model for "healthDataInputs" that aligns with HealthDataInputSchema.  
   - Model for "healthAnalyses" that aligns with the HealthAnalysisSchema.  

3. **Storing the Input**  
   - Modify the /api/analyze (POST) endpoint to store or update the user's health data in "healthDataInputs".  

4. **Running the Analysis**  
   - After storage, the same endpoint calls OpenAI.  
   - On success, store the analysis in "healthAnalyses".  
   - Return the stored analysis or a success message to the frontend.  

5. **Retrieving the Analysis**  
   - Create or modify a results endpoint (e.g., /api/results (GET)) that retrieves the user's stored analysis from "healthAnalyses".  
   - The "ResultsPage" can fetch it using fetch or a React query, then display the data.  

6. **Removing or Minimizing LocalStorage**  
   - Migrate away from localStorage for main data.  
   - Keep localStorage optional for ephemeral caching if desired, but the primary single source of truth is MongoDB.

### 7.1 Creating the MongoDB Client

To efficiently manage database connections in a Next.js application, we recommend creating a single MongoDB client instance per server runtime. Here is a brief outline:

1. Create a new file in your project's “lib” directory, for example:  
   └─ lib/db.ts

2. In “db.ts”, set up a connection helper function that:  
   - Imports MongoClient from “mongodb” (or use Mongoose if preferred).  
   - Checks if a client or a client promise already exists (to avoid re-initializing).  
   - Exports a connected client or a function that retrieves a connected database instance.

3. Adjust your API routes (/api/analyze, /api/results, etc.) to import this helper function.  
   - Each route can call “getDb()” or similar to retrieve the database object.  
   - Insert or query documents in the appropriate collections (healthDataInputs, healthAnalyses).

4. Ensure you have the necessary credentials or environment variables for MongoDB, commonly in .env:
   - E.g., MONGODB_URI=<your-cluster-connection-string>

5. Test your connection by logging or running a simple read/write query.

Refer to the official Next.js documentation for any best practices related to server components or route handlers. This approach helps maintain a single open connection (or pool) rather than creating a new client on every request.

## 8. Conclusion

Adopting these changes will allow our health analytics application to persist user data and analysis results in MongoDB. The final user experience will remain largely the same (submitting a form, seeing results), but we remove reliance on browser localStorage. This design:

- Ensures data persistence and consistency.  
- Allows re-fetching of the user's analysis anytime without re-calling the OpenAI model.  
- Makes it easy to integrate user authentication and security measures.  

By following this design outline, the backend engineer can confidently implement a MongoDB integration that is well-aligned with our existing project structure and data flow.