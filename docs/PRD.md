# Cabmora — Product Requirement Document v1.0

> **Converted from** `Cabmora_Product Requirement Document (PRD)_V1.0 (1).docx`
> (the .docx remains the source of truth — regenerate this file with
> `pandoc -t gfm "<file>.docx" -o docs/PRD.md` if the PRD is revised).
>
> **Version 1.0 · 28/05/2026 · Author: Ayo Ogunwole (Product Manager)**
> Status: *In Progress*. Owner org: Cabmora Limited. Delivery partner:
> Stallion Check Consulting.

# Change History

| Version | Date           | Author  | Comment                           | Shared                        |
| ------- | -------------- | ------- | --------------------------------- | ----------------------------- |
| 1.0     | **28/05/2026** | **Ayo** | **Initial Document (First Copy)** | **Clement, Kenny, and Taiwo** |
|         |                |         |                                   |                               |

# Team

*Stallion Check Consulting* will oversee and manage the end-to-end
scoping, solution design, delivery, testing, and handover of this
initiative.

|                                      |                                                                             |
| ------------------------------------ | --------------------------------------------------------------------------- |
| Product Manager                      | Ayo Ogunwole                                                                |
| Engineering Lead/Solutions Architect | Kenny Kehinde                                                               |
| UX/UI Designer                       | Khadija                                                                     |
| Engineering/Development/Testing      | Taiwo Kehinde + at least 2 other software engineers (TBC) + 2 Testers (TBC) |
| Approvers/Sign-Off                   | Clement (CEO, *Cabmora Limited*)                                            |

**PM Epic**: *Jira Link to be inserted*

**Status of PRD**: **In Progress**

# Overview

*Cabmora Limited*, a B2C + B2B2C start up requires the development of a
*greenfield* digital platform comprising a customer-facing website and
web application designed to support *photography* and *videography*
service delivery.

The platform aims to improve customer experience by enabling customers
to discover services, make enquiries, review work, collaborate with
creators, make payments, and track project progress through a secure
digital experience.

Additionally, the platform intends to provide other photographers and
videographers (*Cabmora Ltd* business clients) with a professional
environment for delivering their media projects, collaborating with
their clients, and managing their customer interactions more
effectively.

The solution will consist of:

  - Website

  - Customer portal/dashboard

  - Media collaboration capabilities

  - Administrative management capabilities

  - Secure media delivery capabilities

  - Partner management capabilities for creators

The initiative is intended to improve professionalism, customer
experience, operational efficiency, and create opportunities for
recurring revenue generation.

# Problem Statement

*Cabmora Ltd* currently lacks a dedicated digital platform capable of
supporting professional media service delivery, customer collaboration,
and secure media project management.

Existing approaches for sharing media assets and managing customer
interactions can create challenges including:

  - Fragmented customer communication

  - Limited visibility of media project progress

  - Unprofessional media delivery methods

  - Difficult collaboration during review and approval processes

  - Limited opportunities for scalable recurring revenue generation

As customer expectations increase for seamless digital experiences,
*Cabmora Ltd* requires a platform that enables efficient service
delivery while supporting future business growth.

# Objectives

1.  **User-Centric Design**: Provide customers with a professional
    digital experience for engaging with photography and videography
    services.

2.  **Seamless Customer Experience**: Enable customers to securely
    review, comment on, approve, and make payment for media
    deliverables.

3.  **Visibility**: Improve project visibility by providing customer
    dashboards and progress tracking capabilities.

4.  **Media Delivery Optimisation**: Reduce operational inefficiencies
    associated with manual media sharing processes.

5.  **Unified Media Platform**: Enable secure media project
    collaboration between customers and creators.

6.  **Revenue Generation**: Create future opportunities for recurring
    revenue generation through creator-focused platform capabilities

7.  **Future-proof design**: Provide scalable infrastructure capable of
    supporting future platform growth.

# Go-To-Market Approach

The initial go-to-market approach for *Cabmora Ltd* will focus on
launching a Minimum Viable Product (MVP) that validates customer demand
while establishing a professional digital experience for photography and
videography service delivery.

The go-to-market strategy, pricing model, customer acquisition channels,
and monetisation approach will be refined during subsequent discovery
and validation activities.

# Success Metrics

To ensure the platform's successful launch and adoption, *Cabmora Ltd*
leadership will monitor and evaluate the following key metrics below. By
closely monitoring these success metrics, *Cabmora Ltd* director(s) can
adjust their strategy as needed to ensure the platform not only meets
its initial launch goals but also continues to grow and provide value to
users over the long term.

Initial success measures are expected to focus on:

<table>
<tbody>
<tr class="odd">
<td><strong>Customer Adoption</strong></td>
<td><ul>
<li><p>Number of customer enquiries generated through the platform</p></li>
<li><p>Number of registered customer accounts</p></li>
<li><p>Number of active platform users</p></li>
<li><p>Number of paying customers</p></li>
</ul></td>
</tr>
<tr class="even">
<td><strong>Customer Experience</strong></td>
<td><ul>
<li><p>Customer satisfaction feedback</p></li>
</ul>
<ul>
<li><p>Reduction in manual communication activities</p></li>
<li><p>Customer completion rates across media project workflows</p></li>
</ul></td>
</tr>
<tr class="odd">
<td><strong>Operational Efficiency</strong></td>
<td><ul>
<li><p>Reduction in manual media project administration activities</p></li>
<li><p>Reduction in time taken to deliver customer media projects</p></li>
<li><p>Increased visibility of media project status and progress</p></li>
</ul></td>
</tr>
<tr class="even">
<td><p><strong>Commercial Performance</strong></p>
<p>(<em>Primarily for management</em>)</p></td>
<td><ul>
<li><p>Number of completed bookings</p></li>
<li><p>Revenue generated through digital channels</p></li>
<li><p>Growth in new and repeat customers</p></li>
</ul></td>
</tr>
</tbody>
</table>

Specific targets and measurement thresholds will be defined during later
discovery phases.

# Constraints

The following constraints are currently known and may influence product
scope, delivery approach, or technical implementation

1.  **Business Constraints**:
    
    1.  Business requirements are still evolving as discovery activities
        continue
    
    2.  Budget constraints have not yet been formally defined
    
    3.  Delivery timelines are subject to validation

2.  **Technical Constraints**:
    
    1.  Large media storage requirements may impact infrastructure
        decisions
    
    2.  Security and file protection requirements require further
        clarification
    
    3.  Integration requirements are currently unknown.

3.  **Delivery Constraints**:
    
    1.  Product scope may require phased delivery to support faster
        market entry
    
    2.  Multiple user types and workflows may increase delivery
        complexity
    
    3.  Requirements for scalability may influence architectural
        decisions early in delivery

Additional constraints will be identified and refined during subsequent
elicitation and solution design activities.

# Persona

<table>
<tbody>
<tr class="odd">
<td><strong>Customer/Client</strong></td>
<td><p><strong>Role</strong>: Individuals or organisations purchasing photography or videography services for occasions or events such as wedding, birthday, business events, graduations etc.</p>
<p><strong>Goals</strong>:</p>
<ul>
<li><p>Browse available services</p></li>
<li><p>Purchase available services</p></li>
<li><p>Review media (<em>photo</em> or <em>video</em>) deliverables</p></li>
<li><p>Track project progress</p></li>
<li><p>Request amendments (<em>provide feedback</em>)</p></li>
<li><p>Make payments</p></li>
</ul>
<p><strong>Pain Points</strong>:</p>
<ul>
<li><p>Limited (or none) project visibility.</p></li>
<li><p>Inefficient feedback processes when using conventional (manual) means.</p></li>
<li><p>Slow media delivery methods</p></li>
</ul></td>
</tr>
<tr class="even">
<td><strong>Partner Photographer</strong></td>
<td><p><strong>Role</strong>: External photographers using the platform to manage their customer interactions and media delivery.</p>
<p><strong>Goals</strong>:</p>
<ul>
<li><p>Deliver projects professionally.</p></li>
<li><p>Manage their customer interactions.</p></li>
<li><p>Share media securely</p></li>
<li><p>Maintain branding consistency</p></li>
</ul>
<p><strong>Pain Points</strong>:</p>
<ul>
<li><p>Reliance on generic storage platforms</p></li>
<li><p>Poor customer experience</p></li>
<li><p>Lack of dedicated collaboration tools.</p></li>
</ul></td>
</tr>
<tr class="odd">
<td><strong>Partner Videographer</strong></td>
<td><p><strong>Role</strong>: External videography professionals delivering video-based projects through the platform.</p>
<p><strong>Goals</strong>:</p>
<ul>
<li><p>Share large media files securely.</p></li>
<li><p>Collaborate with their customers.</p></li>
<li><p>Deliver projects efficiently.</p></li>
</ul>
<p><strong>Pain Points</strong>:</p>
<ul>
<li><p>Large file management challenges.</p></li>
<li><p>Complex feedback to approval processes.</p></li>
</ul></td>
</tr>
<tr class="even">
<td><strong>Platform Administrator</strong></td>
<td><p><strong>Role</strong>: Internal users responsible for managing platform operations.</p>
<p><strong>Goals</strong>:</p>
<ul>
<li><p>Manage project uploads, update or removal.</p></li>
<li><p>Manage users’ accessibility</p></li>
<li><p>Monitor platform usage</p></li>
<li><p>Resolve issues</p></li>
<li><p>Configure platform settings (<em>where applicable</em>)</p></li>
</ul>
<p><strong>Pain Points</strong>:</p>
<ul>
<li><p>Platform complexity</p></li>
</ul></td>
</tr>
</tbody>
</table>

# Use Cases

**Customers/Client achieve the following:**

  - Customer browses website services

  - Customer submits enquiry

  - Customer creates account

  - Customer logs into dashboard

  - Customer previews media deliverables

  - Customer comments on media

  - Customer requests amendments

  - Customer approves completed work

  - Customer makes payment

### Partner Photographers and Videographers achieve the following:

  - ### All the use cases above

  - ### Self-branding (*very simple white labelling*)

  - ### Photographer/Videographer uploads media.

  - ### Photographer/Videographer manages their customer access

# Features (In Scope)

*\[M\]* denotes minimum viable experience requirement for the *Cabmora
Ltd* Platform.

***Note***: These features will have their own separate specs with more
detailed prioritisation and requirement breakdown. This document is
keeping an overall higher-level view of prioritisation by just saying
must have or not.

## Public Website (landing page)

  - *\[M\]* Homepage (benchmark: <https://bigdayproductions.co.uk>).

  - *\[M\]* Display of Event or Promotion banner

  - *\[M\]* Portfolio Showcase

  - *\[M\]* Display Google Review section

  - *\[M\]* Make Enquiry

  - *\[M\]* Display Header section
    
    1.  Our Work/Portfolio
    
    2.  Packages
    
    3.  Deals
        
        1.  Multiple Package Deal
        
        2.  Seminar
        
        3.  Events
    
    4.  News & Views (blogs)
    
    5.  Contact Us
    
    6.  How It Works
    
    7.  Log in (sign in)

  - Knowledge Base
    
    1.  Onboarding workflows (details of how to download, sign in etc)

## Customer/Client Capabilities

  - *\[M\]* Account Creation

  - *\[M\]* Access to Dashboard for project tracking and review:

  - *\[M\]* Have access with or without creating an account

  - *\[M\]* Can preview or comments on photo or video

  - *\[M\]* Can share link access with friends or family to preview
    photo or video:
    
    1.  Must have a registered account
    
    2.  Links encrypted for non-download

  - *\[M\]* Rate deliverable on dashboard

  - *\[M\]* Rated deliverable on dashboard will be automatically posted
    or linked to Google Review:
    
    1.  Must have registered account

  - *\[M\]* Monitor progress:
    
    1.  Must have registered account

  - *\[M\]* Accept work

  - \[M\] Make Payment
    
    1.  Links encrypted for non-download

### 

## Partner Photographer and Videographer (Creators) Capabilities

  - *\[M\]* Memory/space purchase (3GB, 5GB, 7GB etc.)

  - *\[M\]* Upload media

  - *\[M\]* Share secure links

  - *\[M\]* Manage customer access

  - *\[M\]* Enable watermarking

  - *\[M\]* Configure permissions

### 

## Administration

  - *\[M\]* User management.

  - *\[M\]* Project and content management.

# Features (Out of Scope)

  - ### Complex multi-brand white labelling

  - ### Native mobile application (*potential future MVP*)

  - ### Advanced analytics platform

  - ### Social network capabilities

# Design

Sketches and link to the actual designs to be provided once available.
(TBC).

Design standard must meet Web Content Accessibility Guide (WCAG 2.2
Level AA)
<https://www.gov.uk/service-manual/helping-people-to-use-your-service/understanding-wcag>

# Technical Considerations

Link to engineering technical approach document to be provided once
available (TBC).

# Open Issues

Factors still needed to be figured out. Problems that may arise and plan
on addressing them (TBC)?

# Q\&A

Note for key decisions.

|          |          |        |
| -------- | -------- | ------ |
| Asked by | Question | Answer |
| Engineering (Taiwo) | **Do partner creators require approval before they can use creator features?** The signup screen is titled "Join as a Creator" and the designer's mock says *"Application Received … we will contact you within 24 hours"*, but no approval workflow appears anywhere in this PRD. The API currently registers every account as `customer`; becoming a `creator` is an admin action. Confirm the intended model. | *Pending — Ayo* |
| Engineering (Taiwo) | **Where should a creator's portfolio URL, primary specialty and studio name be stored?** All three are collected on the signup form today and discarded, because the API has no field for them. Their home depends on the answer above: application data if creators are approved, profile data if not. | *Pending — Ayo* |
|          |          |        |

# 

# Feature Timeline and Phasing

|         |                |              |
| ------- | -------------- | ------------ |
| Feature | Status         | Dates        |
|         | Backlog        | 7 June, 2026 |
|         | In Development |              |
|         | Backlog        |              |
|         | In Review      |              |
|         | Shipped        |              |
|         | Shipped        |              |
|         | Blocked        |              |
