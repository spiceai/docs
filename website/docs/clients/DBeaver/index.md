---
title: 'DBeaver'
sidebar_label: 'DBeaver'
description: 'Configure DBeaver to query Spice via JDBC'
sidebar_position: 2
pagination_prev: 'clients/index'
pagination_next: null
---

1. Start the Spice runtime with a dataset loaded. Follow the [quickstart guide](/getting-started) to get started.

2. Download [DBeaver Community Edition](https://dbeaver.io).

3. Download the [Apache Arrow Flight SQL JDBC driver](https://search.maven.org/search?q=a:flight-sql-jdbc-driver) - choose the "jar" option.

4. Launch DBeaver

5. In the DBeaver application menu bar, open the "Database" menu and choose: "Driver Manager":
   ![Driver manager menu option](https://imagedelivery.net/HyTs22ttunfIlvyd6vumhQ/691d1f83-c1d0-4ad8-ec8d-d8f37ccc9d00/public 'Driver manager menu option')

6. Click the "New" button on the right:
   ![Driver manager new button](https://imagedelivery.net/HyTs22ttunfIlvyd6vumhQ/5783d944-daae-4735-99e9-976f974bc100/public 'Driver manager new button')

7. Add the JDBC jar file:

   1. Click the "Libraries" tab
   1. Click the: "Add File" button
   1. Choose the "flight-sql-jdbc-driver-15.0.1.jar" jar file (the file downloaded in step 3 above) - and click "Open"
      ![Select jar file](https://imagedelivery.net/HyTs22ttunfIlvyd6vumhQ/19900f7a-f00f-473d-780e-4a28c2ecd800/public 'Select jar file')
   1. Close the Driver editor window with the blue "OK" button on the lower-right

8. Enter the driver settings:

   1. Click the "Settings" tab
   1. In the "Driver Name" field - enter: `Apache Arrow Flight SQL`
   1. In the "URL Template" field - enter: `jdbc:arrow-flight-sql://{host}:{port}?useEncryption=false&disableCertificateVerification=true`

   - If [API key authentication](../../api/auth/index.md) is enabled, the URL template should be: `jdbc:arrow-flight-sql://{host}:{port}?useEncryption=false&disableCertificateVerification=true&user=&password=<enter-api-key-here>` - where `<enter-api-key-here>` is the API key value

   1. In the "Driver Type" drop-down box - choose: "SQLite"
   1. Select "No authentication"

   - This should be selected even if API key authentication is enabled in the runtime, as the API key is supplied via the URL template above.

   1. The driver manager "Edit Driver" window should look like this:
      ![Driver Manager completed](https://imagedelivery.net/HyTs22ttunfIlvyd6vumhQ/20348c42-117b-4763-80d2-6e615b23ae00/public 'Driver Manager completed')
   1. Click the blue "OK" button on the lower-right to save the driver
   1. Close the "Driver Manager" window by clicking the blue "Close" button on the lower-right.

9. Create a new Database Connection:

   1. In the DBeaver application menu bar, open the "Database" menu and choose: "New Database Connection":
      ![New Database Connection](https://imagedelivery.net/HyTs22ttunfIlvyd6vumhQ/acdf7251-4238-44ee-9639-0c557518da00/public 'New Database Connection')
   1. In the "Connect to a database" window - type: `Flight` in the search bar
   1. Choose the `Apache Arrow Flight SQL` driver - the window should look like this:
      ![Connect to a database window](https://imagedelivery.net/HyTs22ttunfIlvyd6vumhQ/61cee5fe-dc75-4ac1-e558-eea3aff4c100/public 'Connect to a database window')
   1. Click the blue "Next >" button on the bottom of the window
   1. On the next screen, the JDBC URL should be filled out already - just supply the Host (`localhost`) and Port (`50051`) values for the Spice runtime. The window should look like this:
      ![Connect to a database window 2](https://imagedelivery.net/HyTs22ttunfIlvyd6vumhQ/2a2b2fdc-00db-49d3-5359-059b12342b00/public 'Connect to a database window 2')
   1. Click the "Test Connection" button - the window should look like this:
      ![Test Connection results](https://imagedelivery.net/HyTs22ttunfIlvyd6vumhQ/a3fc5f5f-a39f-47ce-7955-4b384ec1ae00/public 'Test Connection results')
   1. Click the blue "OK" button to close the Connection test window
   1. Click the "Connection details (name, type, ...)" button on the right
   1. In the "General" section, enter: `Spice Runtime` for the "Connection name". It should look like this:
      ![Name the Database Connection](https://imagedelivery.net/HyTs22ttunfIlvyd6vumhQ/f6d04fe1-92a1-4082-d4ea-e9daacaca200/public)
   1. Click the blue "Finish" button to save the connection

10. Run a query:
    1. Right-click on the Database Connection on the left - choose: "SQL Editor", and then: "Open SQL Console" as shown here:
       ![Open SQL Console](https://imagedelivery.net/HyTs22ttunfIlvyd6vumhQ/642a5885-9e3f-4dd7-ef43-72bfce27bb00/public 'Open SQL Console')
    1. In the Console window - run a query - something like: `SELECT * FROM taxi_trips;`
    1. Click the triangle button to execute the SQL statement - as shown below (or use keyboard shortcut: Ctrl+Enter):
       ![Execute SQL](https://imagedelivery.net/HyTs22ttunfIlvyd6vumhQ/2134e47b-a066-47e9-1d48-06352675f400/public 'Execute SQL')
    1. See the query results as shown in this screenshot:
       ![Query Results](https://imagedelivery.net/HyTs22ttunfIlvyd6vumhQ/0e9f3c0f-2e03-47f9-8d5e-65e078d7e900/public 'Query Results')
    1. DBeaver is now configured to query the Spice runtime using SQL! 🎉
