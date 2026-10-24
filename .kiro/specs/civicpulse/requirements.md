# Requirements Document

## Introduction

CivicPulse is an explainable civic dashboard that surfaces repeated Boston 311 service request patterns and supports equitable human review. It is intended for Boston city operations staff, community organizations, and residents seeking transparent, source-backed information. CivicPulse is not an official City of Boston service and makes no enforcement, benefit, emergency, or eligibility decisions. All data is local sample data and every visualization includes a source citation and stated limitations.

## Glossary

- **Dashboard**: The main CivicPulse web application interface rendered in a browser.
- **311_Request**: A single Boston 311 service request record containing at minimum a case ID, service type, neighborhood, department, open/closed status, and submission date.
- **Neighborhood**: A named geographic area within Boston used to group and filter 311 requests.
- **Service_Topic**: A category label describing the type of service requested (e.g., pothole, street light, rodent activity).
- **Department**: The city department responsible for handling a 311 request.
- **Case_Status**: The current state of a 311 request: open or closed.
- **Time_Period**: A date range used to filter 311 requests.
- **Priority_Card**: A UI component that displays an aggregated score for a Neighborhood–Service_Topic combination, with a plain-language explanation of that score.
- **Open_Case_Pressure**: A score component reflecting the number of currently open cases in a given Neighborhood–Service_Topic grouping.
- **Repeated_Service_Pressure**: A score component reflecting how often the same service type has been requested in the same neighborhood within the selected Time_Period.
- **On_Time_Status**: A score component reflecting the ratio of cases resolved within the expected service-level timeframe to total closed cases.
- **Action_Brief**: A structured text summary attached to a Priority_Card that explains what the data shows, why human review is warranted, the data source, the snapshot date, and the limitations of the data.
- **Preparedness_Page**: A static page presenting historical FEMA Massachusetts disaster declaration data as background context for civic preparedness planning.
- **Sample_Data**: Local JSON or CSV files bundled with the application containing de-identified, synthetic or publicly sourced records used for demonstration without internet access.
- **MA_211**: Massachusetts 211, a statewide social services referral service at mass211.org.
- **Score**: A computed numeric value summarizing the review priority of a Priority_Card based on three transparent, non-personal data components.

---

## Requirements

### Requirement 1: 311 Request Aggregation by Neighborhood

**User Story:** As a city operations staff member, I want to see Boston 311 requests grouped by neighborhood, so that I can quickly understand service demand across the city.

#### Acceptance Criteria

1. THE Dashboard SHALL load and display 311_Request records aggregated by Neighborhood on the main view.
2. WHEN the Dashboard loads, THE Dashboard SHALL read 311_Request records from Sample_Data without making any external network requests.
3. THE Dashboard SHALL display the total count of 311_Request records per Neighborhood in the current view.
4. WHEN a Neighborhood has zero matching 311_Request records after filters are applied, THE Dashboard SHALL display that Neighborhood with a count of zero rather than hiding it.

---

### Requirement 2: Filtering

**User Story:** As a city operations staff member or community organization, I want to filter 311 requests by neighborhood, service topic, department, case status, and time period, so that I can focus on the subset of data most relevant to my work.

#### Acceptance Criteria

1. THE Dashboard SHALL provide a filter control for Neighborhood that allows selecting one or more Neighborhoods.
2. THE Dashboard SHALL provide a filter control for Service_Topic that allows selecting one or more Service_Topics.
3. THE Dashboard SHALL provide a filter control for Department that allows selecting one or more Departments.
4. THE Dashboard SHALL provide a filter control for Case_Status that allows selecting open, closed, or both.
5. THE Dashboard SHALL provide a filter control for Time_Period defined by a start date and an end date.
6. WHEN any filter value changes, THE Dashboard SHALL update all aggregations and Priority_Cards to reflect only the 311_Request records that match all active filter criteria.
7. WHEN no filter is set for a dimension, THE Dashboard SHALL include all values for that dimension in results.
8. IF a filter combination produces no matching 311_Request records, THEN THE Dashboard SHALL display an empty-state message explaining that no data matches the current filters.

---

### Requirement 3: Priority Cards

**User Story:** As a city operations staff member, I want to see priority cards that rank neighborhood and service topic combinations, so that I can quickly identify which situations most warrant human attention.

#### Acceptance Criteria

1. THE Dashboard SHALL render a Priority_Card for each Neighborhood–Service_Topic combination that contains at least one matching 311_Request record under the current filters.
2. THE Dashboard SHALL compute a Score for each Priority_Card using Open_Case_Pressure, Repeated_Service_Pressure, and On_Time_Status as inputs.
3. THE Dashboard SHALL display Priority_Cards in descending Score order by default.
4. WHEN Open_Case_Pressure is computed, THE Dashboard SHALL base it on the count of currently open cases in the Neighborhood–Service_Topic grouping within the active Time_Period.
5. WHEN Repeated_Service_Pressure is computed, THE Dashboard SHALL base it on the frequency of the same Service_Topic in the same Neighborhood within the active Time_Period.
6. WHEN On_Time_Status is computed, THE Dashboard SHALL base it on the ratio of closed cases resolved within the expected service-level timeframe to all closed cases in the grouping.
7. THE Dashboard SHALL display the individual values of Open_Case_Pressure, Repeated_Service_Pressure, and On_Time_Status on each Priority_Card.

---

### Requirement 4: Plain-Language Score Explanation

**User Story:** As a resident or community organization member, I want each priority card to explain its score in plain language, so that I can understand what the data means without specialized training.

#### Acceptance Criteria

1. THE Priority_Card SHALL display a plain-language explanation of the Score that describes the contribution of each score component in non-technical terms.
2. THE Priority_Card SHALL not use algorithmic or statistical jargon in the plain-language explanation.
3. THE Priority_Card SHALL display the explanation text at a reading level accessible to a general audience.

---

### Requirement 5: Action Brief

**User Story:** As a city operations staff member, I want each priority card to include an Action Brief, so that I have a structured, source-cited summary to guide human review decisions.

#### Acceptance Criteria

1. THE Priority_Card SHALL include an Action_Brief section that describes what the underlying data shows for the Neighborhood–Service_Topic combination.
2. THE Action_Brief SHALL include a statement of why a human reviewer should examine the case, derived from the Score components.
3. THE Action_Brief SHALL cite the data source for the 311_Request records displayed.
4. THE Action_Brief SHALL display the snapshot date of the Sample_Data used.
5. THE Action_Brief SHALL include a limitations statement that communicates the boundaries of the data, including that Sample_Data is for demonstration purposes and CivicPulse is not an official City of Boston service.
6. THE Action_Brief SHALL not recommend any enforcement, benefit, emergency, or eligibility decision.

---

### Requirement 6: Preparedness Page

**User Story:** As a community organization, I want to view a Preparedness page, so that I can understand historical disaster context for Massachusetts neighborhoods.

#### Acceptance Criteria

1. THE Dashboard SHALL provide a Preparedness_Page accessible via navigation.
2. THE Preparedness_Page SHALL display historical FEMA Massachusetts disaster declaration data sourced from Sample_Data.
3. THE Preparedness_Page SHALL label all FEMA data with a source citation and the snapshot date.
4. THE Preparedness_Page SHALL display a prominent disclaimer stating that FEMA data is historical context only and is not a live emergency alert or current risk assessment.
5. THE Preparedness_Page SHALL not generate or display any live or real-time emergency notification.
6. IF a user navigates to the Preparedness_Page, THEN THE Preparedness_Page SHALL not make any external network request to retrieve FEMA data.

---

### Requirement 7: External Resource Links

**User Story:** As a resident, I want links to Massachusetts 211 and official data sources, so that I can find additional help and verify the data behind the dashboard.

#### Acceptance Criteria

1. THE Dashboard SHALL display a link to MA_211 (mass211.org) on every page.
2. THE Dashboard SHALL display links to the official sources of the 311 and FEMA data used in the Sample_Data on every page or in a dedicated sources section.
3. WHEN a user activates an external link, THE Dashboard SHALL open it in a new browser tab.
4. THE Dashboard SHALL label each external link with visible text that identifies the destination, rather than using generic labels such as "click here".

---

### Requirement 8: Offline Demo Operation

**User Story:** As a hackathon demonstrator, I want the dashboard to function fully without internet access, so that I can run a reliable demo in any environment.

#### Acceptance Criteria

1. THE Dashboard SHALL load all 311_Request records, FEMA declaration records, and outreach context data exclusively from Sample_Data bundled within the application.
2. WHEN the Dashboard initializes, THE Dashboard SHALL not attempt to fetch data from any remote API or external URL.
3. THE Dashboard SHALL render all charts and Priority_Cards using only Sample_Data.
4. IF a network request fails or is unavailable, THEN THE Dashboard SHALL continue to function using Sample_Data without displaying an error state caused by network unavailability.

---

### Requirement 9: Data Transparency and Source Attribution

**User Story:** As a resident or community organization, I want every data visualization to show its source and limitations, so that I can assess the reliability and scope of what I am seeing.

#### Acceptance Criteria

1. THE Dashboard SHALL display a source label and a limitations note on every chart or map visualization.
2. THE Dashboard SHALL display the snapshot date of the Sample_Data on every page that presents data.
3. THE Dashboard SHALL display a sitewide notice stating that CivicPulse is not an official City of Boston service.

---

### Requirement 10: Safety and Non-Decision Boundaries

**User Story:** As a city operations oversight officer, I want CivicPulse to clearly communicate that it does not make decisions, so that users do not misuse the tool for enforcement or eligibility purposes.

#### Acceptance Criteria

1. THE Dashboard SHALL display a disclaimer on every page stating that CivicPulse does not make enforcement, benefit, emergency, or eligibility decisions.
2. THE Action_Brief SHALL not contain language that directs a reviewer to take a specific enforcement, benefit, or eligibility action.
3. THE Dashboard SHALL not collect, store, or display any personally identifiable information about individual residents.

---

### Requirement 11: Accessibility and Responsive Design

**User Story:** As a resident using assistive technology or a mobile device, I want the dashboard to be accessible and responsive, so that I can use it regardless of my device or ability.

#### Acceptance Criteria

1. THE Dashboard SHALL conform to WCAG 2.1 Level AA success criteria for all interactive and informational components.
2. THE Dashboard SHALL render usably on viewport widths from 320 px to 1920 px without horizontal scrolling.
3. THE Dashboard SHALL provide keyboard navigation for all interactive controls including filters, Priority_Cards, and navigation links.
4. THE Dashboard SHALL provide text alternatives for all non-text content including charts and icons.
5. THE Dashboard SHALL maintain a minimum color contrast ratio of 4.5:1 for all normal text and 3:1 for large text, as defined by WCAG 2.1 criterion 1.4.3.
