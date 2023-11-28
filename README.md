# autoreply_gmail

This Node.js application utilizes the Gmail API to automatically reply to incoming emails based on certain criteria. It checks for unread emails, identifies threads without prior replies, sends automated replies, and adds a label to the email. The app is designed to run at random intervals, providing an automated response mechanism for Gmail users.

## Features

- Automatically replies to unread emails with no prior replies.
- Adds a custom label to processed emails.
- Random intervals for checking and replying to emails.

## Improvements
- Implementing the proper routes for the frontend using axios module
- Automating the process using cron utility rather than the time intervals
- Organizing the functions seperately to look clean and thus providing data abstraction and security to the application.

## Prerequisites

Before you begin, ensure you have the following:

- Node.js and npm installed.
- Gmail API credentials (client ID, client secret, refresh token).
- A Gmail account to be used for sending replies.
- Create the .env file in the project folder add the following CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN that you gathered from the google cloud project and REDIRECT_URI = https://developers.google.com/oauthplayground.

## Installation

 ```bash
   git clone https://github.com/gokulsrepo/autoreply_gmail.git
   cd autoreply_gmail
   npm install
   npm start 
