

# Secrets

App Secrets are key-value pairs that are passed to the Spice Runtime instance as environment secrets. Secrets are securely encrypted and accessible only through the app in which they were created.

Once a secret is saved, its value cannot be retrieved through Spice Cloud. If you need to update the secret value, you must delete the existing secret and create a new one.

### Create a new secret

1. Select your app.
2. Navigate to **Settings** tab and select **Secrets** section.
3. Fill **Secret Name** and **Secret Value** fields and click **Add**.

![image](/img/cloud/CleanShot 2024-12-20 at 01.54.41@2x.png)

4. Saved secrets can be referenced in the Spicepod configuration as\
   `${secrets::<SECRET_NAME>}`, for example:

```yaml
models:   
  - from: openai:gpt-4o
    name: gpt-4o
    params:
      openai_api_key: ${secrets:OPENAI_API_KEY}
```

5. To apply secrets, you must initiate a new spicepod deployment. [Learn more about deployments.](../app-spicepod/deployments.md)
