# minetracker
---

(this README focuses on the frontend project only. for the write-up about MineTracker as a whole, see TODO)

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Overview
The frontend for the MineTracker application. Simply called `minetracker` (as opposed to, e.g., `minetracker-frontend`)
for a simpler, cleaner URL.

This is a React application that calls the API exposed by the `minetracker-api` project (https://github.com/kennypeng15/minetracker-lambda)
and provides an interface for exploring the data returned. The `axios` library is used to make calls, and `recharts` is used 
for constructing graphs. 

## Hosting and Deployment
This application is publicly available at https://kennypeng15.github.io/minetracker/, as it is hosted on GitHub pages.
A custom GitHub action uses the `react-gh-pages` library to automatically push an updated build to the
GitHub repository's `gh-pages` branch whenever changes are made to `main`, meaning source code changes are reflected automatically
on the public site.

If needed, the project can be run locally with `npm start`.