# Learn WebDev Meetup Alexa App

This repository contains the source code for the Learn WebDev Meetup Alexa App.

See the [slides](https://docs.google.com/presentation/d/1jKkvbL-_pGGWjxryY-b7cxD9JgUJBm5LcSTo0eFZFC4/edit?usp=sharing).

## Skills

Currently the App has two skills:

- RSVP counter
- Specific person checker

### RSVP counter

This skill allows you to say "Alexa, ask Learn WebDev how many people will be at the next event".

It adds up all the people that have RSVPed "yes" on the Learn WebDev meetup group (including their plus ones).

### Specific person checker

This skill allows you to ask "Alexa, ask Learn WebDev if Eric will be at the next meetup".

It checks the "yes" RSVPs to see if any of the guests have the name in question.

## Technical requirements

To run the tests, you must have NodeJS installed on your computer.

Clone the repository:

```
git clone https://github.com/learn-webdev/alexa-app
```

Install the required dependencies:

```
cd alexa-app
npm install
```

Run the tests:

```
npm run test
```

All the tests should be passing.

## Deployment

I deploy the app on AWS Lambda. You need to have an AWS account if you want to host your own version of this app.

I use a tool called [Apex](https://github.com/apex/apex) to deploy the code to Lambda. See the repo for installation instructions.

The AWS CLI can be useful as well. We use it in the following instructions to provide our AWS credentials to Apex. [Install it](http://docs.aws.amazon.com/cli/latest/userguide/installing.html) if you don't already have it.

### Local setup

Once you have an AWS account and Apex installed, you need to create an IAM account on AWS that has the proper permissions to manange Lambda deployments.

To do this:

1. On the AWS console, go to Services > IAM > Users > Add user.

2. Enter a user name (e.g. `apex_user`) and select "Programmatic access". Hit "Next: permisssions".

3. Choose "Attach existing policies directly" and hit "Create policy". Choose "Create Your Own Policy".

4. Enter a policy name (e.g. `apex_policy`) and paste this into the policy document: (this is taken from the "Minimum IAM Policy" [here](http://apex.run/))

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "iam:CreateRole",
        "iam:CreatePolicy",
        "iam:AttachRolePolicy",
        "iam:PassRole",
        "lambda:GetFunction",
        "lambda:CreateFunction",
        "lambda:DeleteFunction",
        "lambda:InvokeFunction",
        "lambda:GetFunctionConfiguration",
        "lambda:UpdateFunctionConfiguration",
        "lambda:UpdateFunctionCode",
        "lambda:CreateAlias",
        "lambda:UpdateAlias",
        "lambda:GetAlias",
        "lambda:ListVersionsByFunction",
        "logs:FilterLogEvents",
        "cloudwatch:GetMetricStatistics"
      ],
      "Effect": "Allow",
      "Resource": "*"
    }
  ]
}
```

5. Go back to the tab where you are creating your IAM user. Press the refresh button and select the new policy you just made (`apex_policy`). Hit "Next: review".

6. Hit Create User. Leave the window open.

7. Now we'll use the AWS CLI to provide Apex with the new user's credentials.

8. In your terminal, enter `aws configure`. This will open a prompt that asks for your AWS Access Key Id and Secret Access Key. You can choose the default (`us-east-1`) for the "Default region name" and `json` for the default output format.

9. Now, in the `alexa-app` directory, you can type `apex init`. This will create the required Lambda execution role and a `project.json` file.

10. Copy the role id from `project.json` into `project.example.json`, and give your project a name.

11. Now delete `project.json` and rename `project.example.json` to `project.json`.

12. You should now be able to deploy the function to Lambda with `apex deploy`.

13. Test it out with the following command:

```
apex invoke meetup < test/mock_rsvp_event.json
```

You should see output like:

```json
{"version":"1.0","response":{"directives":[],"shouldEndSession":true,"outputSpeech":{"type":"SSML","ssml":"<speak>27 people have r s v peed</speak>"},"card":{"type":"Simple","content":"
27 people have r s v peed"}},"sessionAttributes":{}}
```

### Alexa App Registration

Finally, to register the Alexa app with Amazon, you will need an account on the [Amazon Developer Console](https://developer.amazon.com/) (this is different from AWS).

After registering:

1. Go to the "Alexa" tab. Click "Get Started" under "Alexa Skills Kit".

2. Add a new skill. Choose "custom interaction model" and enter a name and invocation name.

3. Click "Next".

4. To get the interaction model, run `npm run get-schema` in your terminal.

5. Copy and paste the "schema" and "utterances" to the appropriate boxes.

6. On "Configuration", choose AWS Lambda, select the correct region, then paste in your Lambda function's ARN. This can be found on the Lambda section of the AWS console.
