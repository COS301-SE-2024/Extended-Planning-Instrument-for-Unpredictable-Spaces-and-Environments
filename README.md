# MP6 - Logistics Optimization System - Revolutionizing Logistics Efficiency 🚛

<p align="center">
  <img src="https://github.com/COS301-SE-2024/Extended-Planning-Instrument-for-Unpredictable-Spaces-and-Environments/blob/main/src/assets/Photos/Logos/Logo-Dark.svg" alt="Logistics System Dashboard" width="500"/>
</p>

## Project Description 📦

**Logistics Optimization System** - Unlocking the potential within South Africa's logistics juggernaut: 1.5 billion tonnes of goods annually, 10% of the nation's GDP, and a million-strong workforce. In this landscape of untapped opportunities, our mission is clear – design a system that transforms inefficiency into a symphony of precision. Imagine a logistics realm where every truck is a marvel of intelligent packing and optimal space management. This project isn't just an upgrade; it's a revolution in efficiency.

### Code Quality Badges 🛡️
![image](https://github.com/COS301-SE-2024/Extended-Planning-Instrument-for-Unpredictable-Spaces-and-Environments/assets/130755249/d645989e-9147-44a0-a3fc-5b398450573f) ![Static Badge](https://img.shields.io/badge/Build-passing-brightgreen?logo=github)
![Build Status](https://github.com/COS301-SE-2024/Extended-Planning-Instrument-for-Unpredictable-Spaces-and-Environments/actions/workflows/unitTest.yml/badge.svg) [![GitHub Issues](https://img.shields.io/github/issues/COS301-SE-2024/Extended-Planning-Instrument-for-Unpredictable-Spaces-and-Environments.svg)](https://github.com/COS301-SE-2024/Extended-Planning-Instrument-for-Unpredictable-Spaces-and-Environments/issues)[![Netlify Status](https://api.netlify.com/api/v1/badges/71e3b7b1-8057-43f8-bf0c-a4c09966a75f/deploy-status)](https://app.netlify.com/sites/janeebsolution/deploys)

## Demo Video 🎥
[![Demo1 Thumbnail](https://github.com/COS301-SE-2024/Extended-Planning-Instrument-for-Unpredictable-Spaces-and-Environments/assets/130755249/7ec24e36-c321-47a7-9b28-6e699b44fad6)](https://www.youtube.com/playlist?list=PLGYYgsVv-70oToZzb5FKrY-J9i_26m-jt)

## All Requirement Documents 📄
[Requirements Docs](Docs)

## Project Management 📋
[GitHub Project Board](https://github.com/orgs/COS301-SE-2024/projects/87)

## Team Profiles 👥

| Photo | Name | Profile | LinkedIn |
|-------|------|---------|----------|
| ![Joshua Joseph](Members/Josh.png) | **Joshua Joseph** | Experienced database administrator and backend developer. Known for determination, disciplined work ethic, leadership skills, and logical problem-solving abilities. | [Joshua Joseph](https://www.linkedin.com/in/joshua-joseph-78798a256/) |
| ![Kegan Spolidoro](Members/Kegan.png) | **Kegan Spolidoro** | Known for determination and disciplined work ethic. Strong leadership skills in collaborative environments. Experience as a database administrator for a well-known stud cattle farmer. Skills in database and backend development, specifically integration. | [Kegan Spolidoro](https://www.linkedin.com/in/kegan-spolidoro-6645052b9/?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app) |
| ![Vian Reynecke](Members/Vian.png) | **Vian Reynecke** | Aspiring Computer Science student with a passion for problem-solving, communication, and creative thinking. Co-founder at BlendWeb, with strengths in front-end and UX/UI design. | [Vian Reynecke](https://www.linkedin.com/in/vian-reynecke-a80604282/?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app) |
| ![Resego Morei](Members/Resego.png) | **Resego Morei** | Final year Computer Science student aiming to become a full-stack developer. Strongest languages include C#, C++, Java, TypeScript, and Vanilla JavaScript. Experience in both front-end and back-end development. | [Resego Morei](https://www.linkedin.com/in/resego-morei-436688168/) |
| ![Matt van Coller](Members/Matt.png) | **Matt van Coller** | Third-year Computer Science student with proficiency in Java, Python, and C++. Known for resilience under pressure and strong collaborative spirit. | [Matt van Coller](https://www.linkedin.com/in/matt-van-coller-5a9b6727a/?trk=contact-info) |

## GitHub Information 📚

### Git Structure 🌳
Our repository follows a mono repo structure to keep all project components organized in a single repository, facilitating easy management and collaboration.

### Git Organization and Management 🗂️
We maintain a clear and organized Git structure with branches for development, testing, and production to ensure smooth workflow and code quality.

### Branching Strategy 🔀
Our branching strategy includes:
- **Main Branch:** This is our primary branch used for deployment. It contains the stable version of our application and is updated periodically from the Development branch.
- **Development Branch:** This branch serves as the central hub for all development activities. It is branched off from the Main branch and is used to integrate features and components before they are deemed stable enough for release.
- **Feature Branches:** For individual features or fixes.
- **Release Branches:** For preparing releases.

### Feature Branching 🌿
When developing new features or components, team members should adhere to the following process:
1. **Create a Feature Branch:** Branch off from the Development branch using the naming convention `dev/<feature-name>` for general features or `dev/<parent-feature>/<sub-feature>` for more specific branches.
2. **Develop the Feature:** Work on the feature within this branch, committing changes regularly.
3. **Open a Pull Request:** Once the feature is complete, open a pull request to merge the changes back into the Development branch. This allows for code review and automated checks using GitHub Actions.
4. **Merge into Development:** After review and successful checks, the feature branch is merged into the Development branch.

### Merging to Main 🔗
Once the Development branch is stable and has undergone thorough testing, it is merged back into the Main branch for release. This ensures that the Main branch always contains a stable version of the application ready for deployment.

