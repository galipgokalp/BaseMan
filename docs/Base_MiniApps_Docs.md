<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Base — Resmi Doküman (Çalışma Kopyası)](#base--resmi-dok%C3%BCman-%C3%87al%C4%B1%C5%9Fma-kopyas%C4%B1)
  - [Quick Start / Checklist](#quick-start--checklist)
    - [Related Docs](#related-docs)
    - [Env Checklist](#env-checklist)
    - [Diagrams](#diagrams)
  - [Table of Contents](#table-of-contents)
  - [INTRODUCTION](#introduction)
- [Base](#base)
  - [Why Base?](#why-base)
  - [Global Economy](#global-economy)
  - [Creator Tools](#creator-tools)
  - [Builder Experience](#builder-experience)
  - [Distribution](#distribution)
  - [Start Building](#start-building)
- [Build an App](#build-an-app)
  - [What You'll Achieve](#what-youll-achieve)
  - [Set Up Your Development Environment](#set-up-your-development-environment)
    - [Step: Bootstrap with OnchainKit](#step-bootstrap-with-onchainkit)
      - [Command](#command)
  - [Start building!](#start-building)
- [Vite Installation · OnchainKit](#vite-installation-%C2%B7-onchainkit)
    - [Step: Install Vite](#step-install-vite)
    - [Step: Install OnchainKit](#step-install-onchainkit)
    - [Step: Get A Client API Key](#step-get-a-client-api-key)
      - [Env file```dotenv](#env-filedotenv)
  - [Start building!](#start-building-1)
- [Remix Installation · OnchainKit](#remix-installation-%C2%B7-onchainkit)
    - [Step: Install Remix](#step-install-remix)
      - [Command](#command-1)
  - [Start building!](#start-building-2)
- [Astro Installation · OnchainKit](#astro-installation-%C2%B7-onchainkit)
    - [Step: Install Astro](#step-install-astro)
    - [Step: Install React](#step-install-react)
      - [Command```bash](#commandbash)
  - [Start building!](#start-building-3)
- [<OnchainKitProvider />](#onchainkitprovider-)
  - [Usage](#usage)
      - [Code](#code)
  - [Props](#props)
    - [Chain](#chain)
    - [RPC URL](#rpc-url)
    - [Project ID](#project-id)
    - [Config`config`is an object that can be used to customize the appearance and behavior](#configconfigis-an-object-that-can-be-used-to-customize-the-appearance-and-behavior)
      - [Appearance](#appearance)
      - [Paymaster](#paymaster)
      - [Wallet`wallet`configures the wallet connection experience and has the following properties:](#walletwalletconfigures-the-wallet-connection-experience-and-has-the-following-properties)
    - [Address _\[Deprecation Pending]_`address`is no longer used and will be removed in a future version of](#address-_%5Cdeprecation-pending_addressis-no-longer-used-and-will-be-removed-in-a-future-version-of)
    - [Schema ID _\[Deprecation Pending]_`schemaId`is no longer used as OnchainKit now defaults to using Coinbase](#schema-id-_%5Cdeprecation-pending_schemaidis-no-longer-used-as-onchainkit-now-defaults-to-using-coinbase)
- [Supplemental Providers · OnchainKit](#supplemental-providers-%C2%B7-onchainkit)
  - [Lifecycle Status with `<Swap />`](#lifecycle-status-with-swap-)
    - [`amountChange`Any of the Swap Input fields have been updated.](#amountchangeany-of-the-swap-input-fields-have-been-updated)
      - [Code```ts](#codets)
      - [Code```ts](#codets-1)
      - [Code```ts](#codets-2)
      - [Code```ts](#codets-3)
  - [Returns](#returns)
  - [Parameters](#parameters)
- [API types](#api-types)
  - [`APIError`#### Code```ts](#apierror-codets)
    - [Location Object](#location-object)
      - [CastEmbedLocationContext](#castembedlocationcontext)
      - [JSON](#json)
  - [Schema](#schema)
    - [Send Notification Request Schema](#send-notification-request-schema)
    - [Send Notification Response Schema](#send-notification-response-schema)
  - [Events](#events)
    - [`miniapp_added`Sent when the user adds the Mini App to their Farcaster client (whether or not it was triggered by an`addMiniApp`prompt).](#miniapp_addedsent-when-the-user-adds-the-mini-app-to-their-farcaster-client-whether-or-not-it-was-triggered-by-anaddminiappprompt)
      - [JSON```json](#jsonjson)
      - [JSON```json](#jsonjson-1)
      - [JSON](#json-1)
- [Sign Your Manifest](#sign-your-manifest)
    - [Prerequisites](#prerequisites)
  - [Location](#location)
  - [Sign Your Manifest](#sign-your-manifest-1)
  - [Example Manifest](#example-manifest)
      - [JSON```json](#jsonjson-2)
      - [Ek Varyant 3](#ek-varyant-3)
    - [Prerequisites](#prerequisites-1)
  - [Location](#location-1)
  - [Sign Your Manifest](#sign-your-manifest-2)
  - [Example Manifest](#example-manifest-1)
      - [JSON```json](#jsonjson-3)
  - [Success Verification](#success-verification)
  - [Getting Additional Help](#getting-additional-help)
- [Base App Compatibility](#base-app-compatibility)
  - [Currently Unsupported](#currently-unsupported)
  - [Base app Mini App SDK Supported Features](#base-app-mini-app-sdk-supported-features)
  - [Base App Client Detection](#base-app-client-detection)
      - [Code```tsx](#codetsx)
  - [Next steps](#next-steps)
- [Mobile (React Native)](#mobile-react-native)
  - [Before You Start](#before-you-start)
  - [Step 1: Install Mobile Wallet Protocol Client](#step-1-install-mobile-wallet-protocol-client)
  - [Step 2: Add Polyfills](#step-2-add-polyfills)
    - [Install peer dependencies](#install-peer-dependencies)
  - [Test on Base Sepolia](#test-on-base-sepolia)
- [Accept Recurring Payments](#accept-recurring-payments)
  - [Start accepting recurring payments with Base Pay Subscriptions](#start-accepting-recurring-payments-with-base-pay-subscriptions)
  - [How It Works](#how-it-works)
    - [Step: User Approves Subscription](#step-user-approves-subscription)
    - [Step: Application Charges Periodically](#step-application-charges-periodically)
    - [Step: Smart Period Management](#step-smart-period-management)
    - [Step: User Maintains Control](#step-user-maintains-control)
  - [Implementation Guide](#implementation-guide)
    - [Architecture Overview](#architecture-overview)
    - [Setup: Create Your Subscription Owner Wallet](#setup-create-your-subscription-owner-wallet)
      - [Code```typescript](#codetypescript)
      - [Code](#code-1)
      - [Code](#code-2)
    - [Add Owner Account](#add-owner-account)
      - [Code](#code-3)
  - [Example Use Case](#example-use-case)
- [Use Coinbase Balances Onchain](#use-coinbase-balances-onchain)
  - [Why it matters](#why-it-matters)
      - [Code](#code-4)
      - [Ek Varyant 2](#ek-varyant-2)
- [Other Use Cases](#other-use-cases)
  - [Prerequisites](#prerequisites-2)
  - [Getting the Provider](#getting-the-provider)
  - [Base Account Features](#base-account-features)
  - [Available Use Cases](#available-use-cases)
    - [Sub Accounts](#sub-accounts)
    - [Spend Permissions](#spend-permissions)
    - [Batch Transactions](#batch-transactions)
    - [Gasless Transactions](#gasless-transactions)
    - [Full list of provider methods and capabilities](#full-list-of-provider-methods-and-capabilities)
- [Auth (Sign In With Base)](#auth-sign-in-with-base)
  - [Overview](#overview)
  - [Authentication Flow](#authentication-flow)
  - [Custom Authentication](#custom-authentication)
    - [Setup](#setup)
    - [Frontend Component (Sign In With Base)](#frontend-component-sign-in-with-base)
- [getPaymentStatus](#getpaymentstatus)
  - [Parameters](#parameters-1)
  - [Returns](#returns-1)
  - [Returns](#returns-2)
  - [Integration Examples](#integration-examples)
    - [With Viem](#with-viem)
      - [Code](#code-5)
  - [Security Considerations](#security-considerations)
- [getKeypair](#getkeypair)
  - [Parameters](#parameters-2)
  - [Returns](#returns-3)
  - [Security Considerations](#security-considerations-1)
- [getCryptoKeyAccount](#getcryptokeyaccount)
  - [Parameters](#parameters-3)
  - [Returns](#returns-4)
  - [PROVIDER](#provider)
- [Overview](#overview-1)
  - [Specification](#specification)
      - [Code```ts](#codets-4)
  - [Request Handling](#request-handling)
    - [1. Sent to the Wallet application](#1-sent-to-the-wallet-application)
    - [2. Handled Locally by the SDK](#2-handled-locally-by-the-sdk)
    - [3. Passed to RPC Provider](#3-passed-to-rpc-provider)
      - [Ek Varyant 2](#ek-varyant-2-1)
      - [Ek Varyant 3](#ek-varyant-3-1)
  - [Prerequisites](#prerequisites-3)
  - [Objectives](#objectives)
- [wallet_connect](#wallet_connect)
  - [Parameters](#parameters-4)
  - [Returns](#returns-5)
  - [Error Handling](#error-handling)
  - [Usage with Capabilities](#usage-with-capabilities)
- [wallet_sendCalls](#wallet_sendcalls)
  - [Parameters](#parameters-5)
  - [Returns](#returns-6)
  - [Example Usage](#example-usage)
  - [Error Handling](#error-handling-1)
- [wallet_getCallsStatus](#wallet_getcallsstatus)
  - [Parameters](#parameters-6)
  - [Returns](#returns-7)
  - [Example Usage](#example-usage-1)
  - [Error Handling](#error-handling-2)
  - [CAPABILITIES](#capabilities)
- [Capabilities Overview](#capabilities-overview)
  - [Core Concepts](#core-concepts)
    - [Discovery Pattern](#discovery-pattern)
      - [Code```typescript](#codetypescript-1)
  - [Capability-Specific Guides](#capability-specific-guides)
  - [Related Methods](#related-methods)
- [signInWithEthereum](#signinwithethereum)
  - [Parameters](#parameters-7)
  - [Returns](#returns-8)
  - [Usage with wallet_connect](#usage-with-wallet_connect)
  - [Expected Benefits](#expected-benefits)
  - [Development Status](#development-status)
  - [Preparing for Flow Control](#preparing-for-flow-control)
  - [Related Capabilities](#related-capabilities)
- [paymasterService](#paymasterservice)
  - [Parameters](#parameters-8)
  - [Returns](#returns-9)
  - [Example Usage](#example-usage-2)
  - [Best Practices](#best-practices)
- [auxiliaryFunds](#auxiliaryfunds)
  - [Parameters](#parameters-9)
  - [Returns](#returns-10)
  - [Example Usage](#example-usage-3)
  - [Get a basename for your agent](#get-a-basename-for-your-agent)
  - [COOKBOOK](#cookbook)
  - [Use Cases](#use-cases)
- [Gasless Transactions on Base using a Paymaster](#gasless-transactions-on-base-using-a-paymaster)
  - [Objectives](#objectives-1)
  - [Prerequisites](#prerequisites-4)
  - [Set Up a Base Paymaster & Bundler](#set-up-a-base-paymaster--bundler)
    - [Screenshots](#screenshots)
    - [Allowlist a Sponsorable Contract](#allowlist-a-sponsorable-contract)
    - [Global & Per User Limits](#global--per-user-limits)
  - [Test Your Paymaster Policy](#test-your-paymaster-policy)
    - [Installing Foundry](#installing-foundry)
      - [Command```bash](#commandbash-1)
  - [Conclusion](#conclusion)
  - [References](#references)
  - [Foundations](#foundations)
- [Introduction to Mini Apps](#introduction-to-mini-apps)
      - [Ek Varyant 2](#ek-varyant-2-2)
- [Vibe Coding a Mini App](#vibe-coding-a-mini-app)
- [What is The Base App (TBA)?](#what-is-the-base-app-tba)
- [Vibe Coding Fundamentals](#vibe-coding-fundamentals)
- [Vibe Coding Mini Apps](#vibe-coding-mini-apps)
  - [Vibe Coding Elements](#vibe-coding-elements)
    - [Step: Plan](#step-plan)
    - [Step: UX + Architecture](#step-ux--architecture)
    - [Step: Build the Core Features](#step-build-the-core-features)
    - [Step: Test & Refine](#step-test--refine)
    - [Step: Deploy & Share](#step-deploy--share)
- [Master Prompt Engineering](#master-prompt-engineering)
  - [What makes a good prompt](#what-makes-a-good-prompt)
  - [What makes a prompt effective](#what-makes-a-prompt-effective)
  - [<paste your rough prompt>](#paste-your-rough-prompt)
  - [(B) TEMPLATE:](#b-template)
  - [<paste the prompt template>](#paste-the-prompt-template)
  - [Additional Resources](#additional-resources)
- [Essential Documentation Resources](#essential-documentation-resources)
- [Developer Resources](#developer-resources)
  - [Example Prompt for Understanding Key Tools](#example-prompt-for-understanding-key-tools)
- [AI-Assisted Documentation Reading](#ai-assisted-documentation-reading)
- [Techniques for understanding documentation](#techniques-for-understanding-documentation)
    - [Used tailored prompts](#used-tailored-prompts)
    - [Use Screenshots](#use-screenshots)
    - [Use code snippets](#use-code-snippets)
  - [Writing data to the blockchain](#writing-data-to-the-blockchain)
  - [Interacting with smart contracts](#interacting-with-smart-contracts)
- [null](#null)
- [Gasless Transactions on Base using Base Paymaster](#gasless-transactions-on-base-using-base-paymaster)
  - [Objectives](#objectives-2)
  - [Prerequisites](#prerequisites-5)
  - [Set Up a Base Paymaster & Bundler](#set-up-a-base-paymaster--bundler-1)
    - [Screenshots](#screenshots-1)
    - [Allowlist a Sponsorable Contract](#allowlist-a-sponsorable-contract-1)
    - [Global & Per User Limits](#global--per-user-limits-1)
  - [Test Your Paymaster Policy](#test-your-paymaster-policy-1)
    - [Installing Foundry](#installing-foundry-1)
      - [Command```bash](#commandbash-2)
  - [Conclusion](#conclusion-1)
  - [References](#references-1)
- [Base — Mini Apps ve OnchainKit — Hazır (BaseMan)](#base--mini-apps-ve-onchainkit--haz%C4%B1r-baseman)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

---
title: Base — Resmi Doküman (Çalışma Kopyası)
version: 0.1.0
updatedAt: 2025-11-02
owner: BaseMan
---

<!-- cspell:disable -->

# Base — Resmi Doküman (Çalışma Kopyası)

Kaynaklar:

- https://docs.base.org/
- https://github.com/base

---

## Quick Start / Checklist

- Node >= 20.17 ve npm kurulu.
- Bağımlılıklar: `npm install`
- Yerel geliştirme: `npm run dev`
- Sözleşmeleri derle: `npm run contracts:compile`
- Sepolia’ya dağıt: `npm run contracts:deploy:sepolia` (gerekli env: RPC, PRIVATE_KEY)
- Manifest üret: `npm run manifest:generate` ve onchain config: `npm run onchain:config`
- TOC güncelle: `npm run docs:toc`

### Related Docs

- Farcaster Mini Apps: [Farcaster_MiniApps_Docs.md](Farcaster_MiniApps_Docs.md)
- CDP Paymaster: [CDP_Coinbase_Developer_Docs_MiniApp_Paymaster.md](CDP_Coinbase_Developer_Docs_MiniApp_Paymaster.md)
- Glossary: [glossary.md](glossary.md)

### Env Checklist

- RPC_URL_BASE_SEPOLIA, RPC_URL_BASE, PRIVATE_KEY
- CDP_API_KEY, CDP_PAYMASTER_URL, CDP_BUNDLER_URL
- FARCASTER_CLIENT_ID, FARCASTER_REDIRECT_URI
- WALLETCONNECT_PROJECT_ID, NEXT_PUBLIC_ONCHAINKIT_API_KEY
- Örnek dosya: [env.example](env.example)

### Diagrams

```mermaid
flowchart LR
Dev[Developer] --> C[Compile Contracts (Foundry)]
C --> D[Deploy to Base Sepolia]
D --> V[Verify Deployment]
V --> UI[UI integrates via OnchainKit]
UI --> TX[User Interacts / Transactions]
TX --> Base[Base Network]
```

---
<!-- TOC -->
## Table of Contents
- [INTRODUCTION](#introduction)
- [Why Base?](#why-base)
- [Global Economy](#global-economy)
- [Creator Tools](#creator-tools)
- [Builder Experience](#builder-experience)
- [Distribution](#distribution)
- [Start Building](#start-building)
- [What You'll Achieve](#what-youll-achieve)
- [Set Up Your Development Environment](#set-up-your-development-environment)
 - [Step: Bootstrap with OnchainKit](#step-bootstrap-with-onchainkit)
 - [Step: Install and initialize Foundry](#step-install-and-initialize-foundry)
 - [Step: Configure Foundry with Base](#step-configure-foundry-with-base)
 - [Step: Secure your private key](#step-secure-your-private-key)
- [Deploy Your Contracts](#deploy-your-contracts)
 - [Step: Run the deploy script](#step-run-the-deploy-script)
 - [Step: Save the contract address](#step-save-the-contract-address)
 - [Step: Load the new environment variable](#step-load-the-new-environment-variable)
 - [Step: Verify Your Deployment](#step-verify-your-deployment)
- [Interacting with your contract](#interacting-with-your-contract)
 - [Step: Add the Transaction component](#step-add-the-transaction-component)
 - [Step: Defining the contract calls](#step-defining-the-contract-calls)
 - [Step: Testing the component](#step-testing-the-component)
- [Further Improvements](#further-improvements)
- [PRODUCTS](#products)
- [OnchainKit](#onchainkit)
- [Why OnchainKit?](#why-onchainkit)
- [Automatic Installation](#automatic-installation)
- [Manual Installation](#manual-installation)
- [Testing Your OnchainKit App](#testing-your-onchainkit-app)
- [Start building!](#start-building)
 - [Why Are We Collecting Telemetry?](#why-are-we-collecting-telemetry)
 - [What Data Will Be Collected?](#what-data-will-be-collected)
 - [How Does It Work?](#how-does-it-work)
 - [How Do I Opt Out?](#how-do-i-opt-out)
 - [Why Are We Collecting Telemetry?](#why-are-we-collecting-telemetry)
 - [What Data Will Be Collected?](#what-data-will-be-collected)
 - [How Does It Work?](#how-does-it-work)
 - [How Do I Opt Out?](#how-do-i-opt-out)
- [Common Issues](#common-issues)
 - [Environment Setup](#environment-setup)
 - [Dependencies](#dependencies)
 - [Provider Configuration](#provider-configuration)
 - [Wallet Connection](#wallet-connection)
 - [Transaction Issues](#transaction-issues)
 - [Identity Components](#identity-components)
 - [Theme Issues](#theme-issues)
 - [React Native](#react-native)
 - [Module Resolution](#module-resolution)
- [Getting Help](#getting-help)
- [Common Issues](#common-issues)
 - [Environment Setup](#environment-setup)
 - [Dependencies](#dependencies)
 - [Provider Configuration](#provider-configuration)
 - [Wallet Connection](#wallet-connection)
 - [Transaction Issues](#transaction-issues)
 - [Identity Components](#identity-components)
 - [Theme Issues](#theme-issues)
 - [React Native](#react-native)
 - [Module Resolution](#module-resolution)
- [Getting Help](#getting-help)
- [Common Issues](#common-issues)
 - [Environment Setup](#environment-setup)
 - [Dependencies](#dependencies)
 - [Provider Configuration](#provider-configuration)
 - [Wallet Connection](#wallet-connection)
 - [Transaction Issues](#transaction-issues)
 - [Identity Components](#identity-components)
 - [Theme Issues](#theme-issues)
 - [React Native](#react-native)
 - [Module Resolution](#module-resolution)
- [Getting Help](#getting-help)
- [Common Issues](#common-issues)
 - [Environment Setup](#environment-setup)
 - [Dependencies](#dependencies)
 - [Provider Configuration](#provider-configuration)
 - [Wallet Connection](#wallet-connection)
 - [Transaction Issues](#transaction-issues)
 - [Identity Components](#identity-components)
 - [Theme Issues](#theme-issues)
 - [React Native](#react-native)
 - [Module Resolution](#module-resolution)
- [Getting Help](#getting-help)
 - [Step: Install Next.js](#step-install-nextjs)
 - [Step: Install OnchainKit](#step-install-onchainkit)
 - [Step: Get Your Client API Key](#step-get-your-client-api-key)
 - [Step: Add Providers](#step-add-providers)
 - [Step: Wrap your app with <Providers />](#step-wrap-your-app-with-providers)
 - [Step: Add Styles](#step-add-styles)
- [Start building!](#start-building)
 - [Step: Install Vite](#step-install-vite)
 - [Step: Install OnchainKit](#step-install-onchainkit)
 - [Step: Get A Client API Key](#step-get-a-client-api-key)
 - [Step: Add Providers](#step-add-providers)
 - [Step: Wrap your app with <AppProviders />](#step-wrap-your-app-with-appproviders)
 - [Step: Import OnchainKit Styles](#step-import-onchainkit-styles)
- [Start building!](#start-building)
 - [Step: Install Remix](#step-install-remix)
 - [Step: Install OnchainKit](#step-install-onchainkit)
 - [Step: Get A Client API Key](#step-get-a-client-api-key)
 - [Step: Add Providers](#step-add-providers)
 - [Step: Wrap your app with <AppProviders />](#step-wrap-your-app-with-appproviders)
 - [Step: Import OnchainKit Styles](#step-import-onchainkit-styles)
- [Start building!](#start-building)
 - [Step: Install Astro](#step-install-astro)
 - [Step: Install React](#step-install-react)
 - [Step: Install OnchainKit](#step-install-onchainkit)
 - [Step: Get A Client API Key](#step-get-a-client-api-key)
 - [Step: Add Providers](#step-add-providers)
 - [Step: Wrap your OnchainKit components with <AppProviders />](#step-wrap-your-onchainkit-components-with-appproviders)
 - [Step: Add OnchainKit Components to your App](#step-add-onchainkit-components-to-your-app)
 - [Step: Import OnchainKit Styles](#step-import-onchainkit-styles)
- [Start building!](#start-building)
- [Usage](#usage)
- [Props](#props)
 - [Chain](#chain)
 - [`apiKey`](#apikey)
 - [RPC URL](#rpc-url)
 - [Project ID](#project-id)
 - [Config](#config)
 - [Address *\[Deprecation Pending]*](#address-deprecation-pending)
 - [Schema ID *\[Deprecation Pending]*](#schema-id-deprecation-pending)
- [Start building!](#start-building)
- [How to listen to the Lifecycle Status](#how-to-listen-to-the-lifecycle-status)
- [Lifecycle Status](#lifecycle-status)
 - [`init`](#init)
 - [`success`](#success)
 - [`error`](#error)
- [Lifecycle Status with [`<Swap />`](/onchainkit/swap/swap)](#lifecycle-status-with-swap-onchainkitswapswap)
 - [`amountChange`](#amountchange)
 - [`transactionPending`](#transactionpending)
 - [`transactionApproved`](#transactionapproved)
 - [`success`](#success)
- [Lifecycle Status with [`<Transaction />`](/onchainkit/transaction/transaction)](#lifecycle-status-with-transaction-onchainkittransactiontransaction)
 - [`transactionIdle`](#transactionidle)
 - [`transactionPending`](#transactionpending)
 - [`success`](#success)
- [How to listen to the Lifecycle Status](#how-to-listen-to-the-lifecycle-status)
- [Lifecycle Status](#lifecycle-status)
 - [`init`](#init)
 - [`success`](#success)
 - [`error`](#error)
- [Lifecycle Status with [`<Swap />`](/onchainkit/swap/swap)](#lifecycle-status-with-swap-onchainkitswapswap)
 - [`amountChange`](#amountchange)
 - [`transactionPending`](#transactionpending)
 - [`transactionApproved`](#transactionapproved)
 - [`success`](#success)
- [Lifecycle Status with [`<Transaction />`](/onchainkit/transaction/transaction)](#lifecycle-status-with-transaction-onchainkittransactiontransaction)
 - [`transactionIdle`](#transactionidle)
 - [`transactionPending`](#transactionpending)
 - [`success`](#success)
- [How to listen to the Lifecycle Status](#how-to-listen-to-the-lifecycle-status)
- [Lifecycle Status](#lifecycle-status)
 - [`init`](#init)
 - [`success`](#success)
 - [`error`](#error)
- [Lifecycle Status with [`<Swap />`](/onchainkit/swap/swap)](#lifecycle-status-with-swap-onchainkitswapswap)
 - [`amountChange`](#amountchange)
 - [`transactionPending`](#transactionpending)
 - [`transactionApproved`](#transactionapproved)
 - [`success`](#success)
- [Lifecycle Status with [`<Transaction />`](/onchainkit/transaction/transaction)](#lifecycle-status-with-transaction-onchainkittransactiontransaction)
 - [`transactionIdle`](#transactionidle)
 - [`transactionPending`](#transactionpending)
 - [`success`](#success)
- [Overview](#overview)
- [Built-in Themes](#built-in-themes)
- [Mode](#mode)
- [CSS Overrides](#css-overrides)
- [Custom Theme](#custom-theme)
 - [Step: New to OnchainKit?](#step-new-to-onchainkit)
 - [Step: Already using OnchainKit?](#step-already-using-onchainkit)
- [React components with `<Avatar>`and`<Name>`](#react-components-with-avatar-and-name)
- [React hooks with `useAvatar`and`useName`](#react-hooks-with-useavatar-and-usename)
- [Typescript utility with `getAvatar`and`getName`](#typescript-utility-with-getavatar-and-getname)
- [AI Tooling](#ai-tooling)
 - [Replit](#replit)
 - [Cursor](#cursor)
 - [Using OnchainKit with CDP SDK](#using-onchainkit-with-cdp-sdk)
- [Understanding Context Windows](#understanding-context-windows)
 - [Why Context Matters](#why-context-matters)
 - [Optimizing for Context Windows](#optimizing-for-context-windows)
- [Setting Up AI Tools](#setting-up-ai-tools)
 - [Configuring Cursor Rules](#configuring-cursor-rules)
 - [Setting Up an OnchainKit Project](#setting-up-an-onchainkit-project)
 - [Creating Project Documentation](#creating-project-documentation)
- [Effective Prompting Strategies](#effective-prompting-strategies)
 - [Be Specific and Direct](#be-specific-and-direct)
 - [Provide Context for Complex Tasks](#provide-context-for-complex-tasks)
 - [Ask for Iterations](#ask-for-iterations)
- [Working with OnchainKit](#working-with-onchainkit)
 - [Leveraging LLMs.txt for Documentation](#leveraging-llmstxt-for-documentation)
 - [Component Integration Example](#component-integration-example)
- [Debugging with AI](#debugging-with-ai)
 - [Effective Debugging Prompts](#effective-debugging-prompts)
 - [When You're Stuck](#when-youre-stuck)
- [Advanced Prompting Techniques](#advanced-prompting-techniques)
- [Best Practices Summary](#best-practices-summary)
- [Understanding Context Windows](#understanding-context-windows)
 - [Why Context Matters](#why-context-matters)
 - [Optimizing for Context Windows](#optimizing-for-context-windows)
- [Setting Up AI Tools](#setting-up-ai-tools)
 - [Configuring Cursor Rules](#configuring-cursor-rules)
 - [Setting Up an OnchainKit Project](#setting-up-an-onchainkit-project)
 - [Creating Project Documentation](#creating-project-documentation)
- [Effective Prompting Strategies](#effective-prompting-strategies)
 - [Be Specific and Direct](#be-specific-and-direct)
 - [Provide Context for Complex Tasks](#provide-context-for-complex-tasks)
 - [Ask for Iterations](#ask-for-iterations)
- [Working with OnchainKit](#working-with-onchainkit)
 - [Leveraging LLMs.txt for Documentation](#leveraging-llmstxt-for-documentation)
 - [Component Integration Example](#component-integration-example)
- [Debugging with AI](#debugging-with-ai)
 - [Effective Debugging Prompts](#effective-debugging-prompts)
 - [When You're Stuck](#when-youre-stuck)
- [Advanced Prompting Techniques](#advanced-prompting-techniques)
- [Best Practices Summary](#best-practices-summary)
- [What is OnchainTestKit?](#what-is-onchaintestkit)
- [Why Use OnchainTestKit?](#why-use-onchaintestkit)
- [Want to learn more?](#want-to-learn-more)
- [Architecture](#architecture)
- [Key Features](#key-features)
- [Next Steps](#next-steps)
- [Usage](#usage)
- [Returns](#returns)
- [Parameters](#parameters)
- [Usage](#usage)
- [Returns](#returns)
- [Parameters](#parameters)
- [Usage](#usage)
- [Returns](#returns)
- [Parameters](#parameters)
- [Usage](#usage)
- [Returns](#returns)
- [Parameters](#parameters)
- [`APIError`](#apierror)
- [`BuildPayTransactionParams`](#buildpaytransactionparams)
- [`BuildPayTransactionResponse`](#buildpaytransactionresponse)
- [`BuildSwapTransaction`](#buildswaptransaction)
- [`BuildSwapTransactionParams`](#buildswaptransactionparams)
- [`BuildSwapTransactionResponse`](#buildswaptransactionresponse)
- [`GetSwapQuoteParams`](#getswapquoteparams)
- [`GetSwapQuoteResponse`](#getswapquoteresponse)
- [`GetTokensOptions`](#gettokensoptions)
- [`GetTokensResponse`](#gettokensresponse)
- [`GetTokenDetailsParams`](#gettokendetailsparams)
- [`GetTokenDetailsResponse`](#gettokendetailsresponse)
- [`GetMintDetailsParams`](#getmintdetailsparams)
- [`GetMintDetailsResponse`](#getmintdetailsresponse)
- [`BuildMintTransactionParams`](#buildminttransactionparams)
- [`BuildMintTransactionResponse`](#buildminttransactionresponse)
- [`GetPortfoliosParams`](#getportfoliosparams)
- [`GetPortfoliosResponse`](#getportfoliosresponse)
- [`APIError`](#apierror)
- [`BuildPayTransactionParams`](#buildpaytransactionparams)
- [`BuildPayTransactionResponse`](#buildpaytransactionresponse)
- [`BuildSwapTransaction`](#buildswaptransaction)
- [`BuildSwapTransactionParams`](#buildswaptransactionparams)
- [`BuildSwapTransactionResponse`](#buildswaptransactionresponse)
- [`GetSwapQuoteParams`](#getswapquoteparams)
- [`GetSwapQuoteResponse`](#getswapquoteresponse)
- [`GetTokensOptions`](#gettokensoptions)
- [`GetTokensResponse`](#gettokensresponse)
- [`GetTokenDetailsParams`](#gettokendetailsparams)
- [`GetTokenDetailsResponse`](#gettokendetailsresponse)
- [`GetMintDetailsParams`](#getmintdetailsparams)
- [`GetMintDetailsResponse`](#getmintdetailsresponse)
- [`BuildMintTransactionParams`](#buildminttransactionparams)
- [`BuildMintTransactionResponse`](#buildminttransactionresponse)
- [`GetPortfoliosParams`](#getportfoliosparams)
- [`GetPortfoliosResponse`](#getportfoliosresponse)
- [`AddressReact`](#addressreact)
- [`Attestation`](#attestation)
- [`AvatarReact`](#avatarreact)
- [`BadgeReact`](#badgereact)
- [`BaseMainnetName`](#basemainnetname)
- [`Basename`](#basename)
- [`BaseSepoliaName`](#basesepolianame)
- [`EASSchemaUid`](#easschemauid)
- [`EASChainDefinition`](#easchaindefinition)
- [`EthBalanceReact`](#ethbalancereact)
- [`GetAddress`](#getaddress)
- [`GetAddressReturnType`](#getaddressreturntype)
- [`GetAttestationsOptions`](#getattestationsoptions)
- [`GetAvatar`](#getavatar)
- [`GetAvatarReturnType`](#getavatarreturntype)
- [`GetName`](#getname)
- [`GetNameReturnType`](#getnamereturntype)
- [`GetNames`](#getnames)
- [`IdentityCardReact`](#identitycardreact)
- [`IdentityContextType`](#identitycontexttype)
- [`IdentityReact`](#identityreact)
- [`NameReact`](#namereact)
- [`UseAddressOptions`](#useaddressoptions)
- [`UseAvatarOptions`](#useavataroptions)
- [`UseAvatarsOptions`](#useavatarsoptions)
- [`UseNameOptions`](#usenameoptions)
- [`UseNamesOptions`](#usenamesoptions)
- [`LifecycleStatus`](#lifecyclestatus)
- [`SignatureReact`](#signaturereact)
- [`SignatureButtonProps`](#signaturebuttonprops)
- [`SignatureStatusProps`](#signaturestatusprops)
- [`SignatureToastProps`](#signaturetoastprops)
- [`SignatureIconProps`](#signatureiconprops)
- [`SignatureLabelProps`](#signaturelabelprops)
- [`MessageType`](#messagetype)
- [`ValidateMessageResult`](#validatemessageresult)
- [`MessageData`](#messagedata)
- [`SignatureProviderProps`](#signatureproviderprops)
- [`LifecycleStatus`](#lifecyclestatus)
- [`SignatureReact`](#signaturereact)
- [`SignatureButtonProps`](#signaturebuttonprops)
- [`SignatureStatusProps`](#signaturestatusprops)
- [`SignatureToastProps`](#signaturetoastprops)
- [`SignatureIconProps`](#signatureiconprops)
- [`SignatureLabelProps`](#signaturelabelprops)
- [`MessageType`](#messagetype)
- [`ValidateMessageResult`](#validatemessageresult)
- [`MessageData`](#messagedata)
- [`SignatureProviderProps`](#signatureproviderprops)
- [`LifecycleStatus`](#lifecyclestatus)
- [`SignatureReact`](#signaturereact)
- [`SignatureButtonProps`](#signaturebuttonprops)
- [`SignatureStatusProps`](#signaturestatusprops)
- [`SignatureToastProps`](#signaturetoastprops)
- [`SignatureIconProps`](#signatureiconprops)
- [`SignatureLabelProps`](#signaturelabelprops)
- [`MessageType`](#messagetype)
- [`ValidateMessageResult`](#validatemessageresult)
- [`MessageData`](#messagedata)
- [`SignatureProviderProps`](#signatureproviderprops)
- [`ConnectWalletReact`](#connectwalletreact)
- [`IsValidAAEntrypointOptions`](#isvalidaaentrypointoptions)
- [`IsWalletACoinbaseSmartWalletOptions`](#iswalletacoinbasesmartwalletoptions)
- [`IsWalletACoinbaseSmartWalletResponse`](#iswalletacoinbasesmartwalletresponse)
- [`WalletContextType`](#walletcontexttype)
- [`WalletReact`](#walletreact)
- [`WalletDropdownBasenameReact`](#walletdropdownbasenamereact)
- [`WalletDropdownReact`](#walletdropdownreact)
- [`WalletDropdownDisconnectReact`](#walletdropdowndisconnectreact)
- [`WalletDropdownFundLinkReact`](#walletdropdownfundlinkreact)
- [`WalletDropdownLinkReact`](#walletdropdownlinkreact)
- [`WalletAdvancedReact`](#walletadvancedreact)
- [`WalletAdvancedContextType`](#walletadvancedcontexttype)
- [Setup](#setup)
 - [Clone the repo](#clone-the-repo)
 - [Install Node and pnpm](#install-node-and-pnpm)
 - [Install dependencies](#install-dependencies)
- [Codebase](#codebase)
- [Workflows](#workflows)
 - [Development](#development)
 - [Building](#building)
 - [Testing](#testing)
 - [Updating changelog](#updating-changelog)
- [Feature request](#feature-request)
- [MINI APPS](#mini-apps)
- [Quickstart](#quickstart)
 - [Step: Add the MiniApp SDK](#step-add-the-miniapp-sdk)
 - [Step: Trigger App Display](#step-trigger-app-display)
 - [Step: Host the Manifest](#step-host-the-manifest)
 - [Step: Update the Manifest](#step-update-the-manifest)
 - [Step: Create accountAssociation Credentials](#step-create-accountassociation-credentials)
 - [Step: Push updates to production](#step-push-updates-to-production)
 - [Step: Preview Your App](#step-preview-your-app)
 - [Step: Post to Publish](#step-post-to-publish)
- [Register for Base Build](#register-for-base-build)
- [Authentication](#authentication)
- [Manifest](#manifest)
- [Embeds & Previews](#embeds-previews)
- [Search & Discovery](#search-discovery)
- [Sharing & Social Graph](#sharing-social-graph)
- [Notifications](#notifications)
- [UX Best Practices](#ux-best-practices)
- [Build for Growth](#build-for-growth)
 - [Step: Ask yourself](#step-ask-yourself)
 - [Step: Audience fit](#step-audience-fit)
 - [Step: Successful apps](#step-successful-apps)
 - [Step: Group chat focus](#step-group-chat-focus)
 - [Featured Guidelines](#featured-guidelines)
- [Implementation](#implementation)
- [Schema](#schema)
 - [accountAssociation](#accountassociation)
 - [baseBuilder](#basebuilder)
- [Related Concepts](#related-concepts)
- [Implementation](#implementation)
- [Schema](#schema)
 - [accountAssociation](#accountassociation)
 - [baseBuilder](#basebuilder)
- [Related Concepts](#related-concepts)
- [Implementation](#implementation)
- [Schema](#schema)
 - [User Object](#user-object)
 - [Location Object](#location-object)
 - [Client Object](#client-object)
 - [Features Object](#features-object)
- [Implementation](#implementation)
- [Schema](#schema)
 - [Button Configuration](#button-configuration)
 - [Action Configuration](#action-configuration)
- [Related Concepts](#related-concepts)
- [Implementation](#implementation)
- [Schema](#schema)
 - [Button Configuration](#button-configuration)
 - [Action Configuration](#action-configuration)
- [Related Concepts](#related-concepts)
- [Default Wallets in Mini Apps](#default-wallets-in-mini-apps)
- [For Mini App Development](#for-mini-app-development)
 - [Step: Detect Base Account Capabilities](#step-detect-base-account-capabilities)
 - [Step: Implement Sponsored Gas Transactions](#step-implement-sponsored-gas-transactions)
 - [Step: Optimize Transaction Patterns](#step-optimize-transaction-patterns)
- [Base Account Benefits for Mini Apps](#base-account-benefits-for-mini-apps)
- [Implementation Examples](#implementation-examples)
 - [Capability Detection](#capability-detection)
 - [Sponsored Gas Implementation](#sponsored-gas-implementation)
 - [Capability-Based UI](#capability-based-ui)
- [Additional Resources](#additional-resources)
- [Overview](#overview)
- [Client App Behavior](#client-app-behavior)
- [Implementation](#implementation)
 - [Step: Install @farcaster/miniapp-node](#step-install-farcasterminiapp-node)
 - [Step: Create a webhook server](#step-create-a-webhook-server)
 - [Step: Add the Webhook URL to your manifest](#step-add-the-webhook-url-to-your-manifest)
 - [Step: Prompt users to add your Mini App](#step-prompt-users-to-add-your-mini-app)
 - [Step: Save the token and URL from the webhook event](#step-save-the-token-and-url-from-the-webhook-event)
 - [Step: Send notifications](#step-send-notifications)
- [Schema](#schema)
 - [Send Notification Request Schema](#send-notification-request-schema)
 - [Send Notification Response Schema](#send-notification-response-schema)
- [Events](#events)
 - [`miniapp_added`](#miniappadded)
 - [`miniapp_removed`](#miniappremoved)
 - [`notifications_enabled`](#notificationsenabled)
 - [`notifications_disabled`](#notificationsdisabled)
- [Implementation](#implementation)
 - [Step 1: Frontend Authentication](#step-1-frontend-authentication)
 - [Step 2: Backend Verification](#step-2-backend-verification)
- [Schema](#schema)
 - [JWT Payload](#jwt-payload)
- [Implementation](#implementation)
 - [Step 1: Frontend Authentication](#step-1-frontend-authentication)
 - [Step 2: Backend Verification](#step-2-backend-verification)
- [Schema](#schema)
 - [JWT Payload](#jwt-payload)
 - [Prerequisites](#prerequisites)
- [Location](#location)
- [Sign Your Manifest](#sign-your-manifest)
- [Example Manifest](#example-manifest)
 - [Prerequisites](#prerequisites)
- [Location](#location)
- [Sign Your Manifest](#sign-your-manifest)
- [Example Manifest](#example-manifest)
 - [Prerequisites](#prerequisites)
- [Location](#location)
- [Sign Your Manifest](#sign-your-manifest)
- [Example Manifest](#example-manifest)
 - [Prerequisites](#prerequisites)
- [Location](#location)
- [Sign Your Manifest](#sign-your-manifest)
- [Example Manifest](#example-manifest)
 - [Prerequisites](#prerequisites)
- [Location](#location)
- [Sign Your Manifest](#sign-your-manifest)
- [Example Manifest](#example-manifest)
 - [Display](#display)
 - [Layout](#layout)
 - [Navigation](#navigation)
 - [Colors](#colors)
 - [**Color Palette**](#color-palette)
 - [**Themes**](#themes)
 - [Typography](#typography)
 - [Spacing](#spacing)
 - [Touch Interactions](#touch-interactions)
 - [Display](#display)
 - [Layout](#layout)
 - [Prerequisites](#prerequisites)
- [Location](#location)
- [Sign Your Manifest](#sign-your-manifest)
- [Example Manifest](#example-manifest)
- [Implementation](#implementation)
 - [Step: Install the required package](#step-install-the-required-package)
 - [Step: Create the image generation API endpoint](#step-create-the-image-generation-api-endpoint)
 - [Step: Create shareable page with dynamic metadata](#step-create-shareable-page-with-dynamic-metadata)
 - [Step: Add share button with composeCast](#step-add-share-button-with-composecast)
 - [Step: Test the flow](#step-test-the-flow)
- [Related Concepts](#related-concepts)
- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Enable Notifications](#enable-notifications)
 - [Step: Set up Notifications on Neynar](#step-set-up-notifications-on-neynar)
 - [Step: Add Webhook URL to Manifest](#step-add-webhook-url-to-manifest)
- [Prompt Users to Add Your App](#prompt-users-to-add-your-app)
 - [Step: Install the Neynar React package](#step-install-the-neynar-react-package)
 - [Step: Prompt users to add your Mini App](#step-prompt-users-to-add-your-mini-app)
- [Send Notifications to Users](#send-notifications-to-users)
 - [Option 1: API](#option-1-api)
 - [Step: Install the Neynar Node.js SDK](#step-install-the-neynar-nodejs-sdk)
 - [Step: Create a notification sending function](#step-create-a-notification-sending-function)
 - [Step: Send notifications](#step-send-notifications)
 - [Option 2: Neynar UI](#option-2-neynar-ui)
 - [Step: Log in to the Neynar Dev Portal](#step-log-in-to-the-neynar-dev-portal)
 - [Step: Click the Broadcast button](#step-click-the-broadcast-button)
 - [Step: Authentication](#step-authentication)
 - [Step: Onboarding Flow](#step-onboarding-flow)
 - [Step: Base Compatibility](#step-base-compatibility)
 - [Step: Layout](#step-layout)
 - [Step: Load Time](#step-load-time)
 - [Step: Usability](#step-usability)
 - [Step: App Metadata](#step-app-metadata)
- [Next Steps](#next-steps)
- [Load Time](#load-time)
- [Onboarding Flow](#onboarding-flow)
- [User Information & Privacy](#user-information-privacy)
- [User Profile](#user-profile)
- [App Description](#app-description)
- [App Cover Photo](#app-cover-photo)
- [App Icon](#app-icon)
 - [Display](#display)
 - [Layout](#layout)
 - [Navigation](#navigation)
 - [Colors](#colors)
 - [**Color Palette**](#color-palette)
 - [**Themes**](#themes)
 - [Typography](#typography)
 - [Spacing](#spacing)
 - [Touch Interactions](#touch-interactions)
- [Complete Metadata](#complete-metadata)
- [In-app Authentication](#in-app-authentication)
- [Client-Agnostic](#client-agnostic)
- [Sponsor Transactions](#sponsor-transactions)
- [Batch Transactions (EIP-5792)](#batch-transactions-eip-5792)
- [Beyond the App Store Model](#beyond-the-app-store-model)
- [What Makes Mini Apps Different](#what-makes-mini-apps-different)
 - [For Users: Frictionless Discovery and Engagement](#for-users-frictionless-discovery-and-engagement)
 - [For Builders: Built-in Social Infrastructure](#for-builders-built-in-social-infrastructure)
- [The Builder's Advantage](#the-builders-advantage)
- [The Network Effect Advantage](#the-network-effect-advantage)
- [What You Can Build](#what-you-can-build)
- [From Idea to Live Application](#from-idea-to-live-application)
 - [Step: Build your Mini App](#step-build-your-mini-app)
 - [Step: Deploy directly](#step-deploy-directly)
 - [Step: Get discovered automatically](#step-get-discovered-automatically)
 - [Step: Iterate based on real usage](#step-iterate-based-on-real-usage)
- [Start Building Today](#start-building-today)
 - [Overview](#overview)
 - [Recommended onboarding flow](#recommended-onboarding-flow)
 - [Step: First render](#step-first-render)
 - [Step: User initiates a protected action](#step-user-initiates-a-protected-action)
 - [Step: Celebrate and amplify](#step-celebrate-and-amplify)
 - [UX patterns that work](#ux-patterns-that-work)
 - [Authentication and wallet guidance](#authentication-and-wallet-guidance)
 - [Do not use raw deeplinks](#do-not-use-raw-deeplinks)
 - [Measure activation and iterate](#measure-activation-and-iterate)
 - [Implementation checklist](#implementation-checklist)
 - [Further reading](#further-reading)
- [How to Use This Guide](#how-to-use-this-guide)
 - [Step: Pressure‑Test Your Idea](#step-pressuretest-your-idea)
 - [Step: Interpret Feedback & Choose Dimensions](#step-interpret-feedback-choose-dimensions)
 - [Step: Apply a Case Study Flow](#step-apply-a-case-study-flow)
 - [Step: Explore Three Core Patterns](#step-explore-three-core-patterns)
 - [Step: Next Steps & Reflection](#step-next-steps-reflection)
- [Pressure-test your idea](#pressure-test-your-idea)
- [Social Patterns](#social-patterns)
 - [1. Identity Playgrounds](#1-identity-playgrounds)
 - [2. Co-Creation Loops](#2-co-creation-loops)
 - [3. Long-Term Rituals](#3-long-term-rituals)
- [Interpreting your feedback](#interpreting-your-feedback)
 - [Step: Spot your top dimensions](#step-spot-your-top-dimensions)
 - [Step: Validate your winners](#step-validate-your-winners)
 - [Step: Decide your next move](#step-decide-your-next-move)
- [Closing note](#closing-note)
- [How Rewards Work](#how-rewards-work)
 - [Step: Verify your Mini App](#step-verify-your-mini-app)
 - [Step: Access earning opportunities](#step-access-earning-opportunities)
- [Next Steps](#next-steps)
- [Prerequisites & Setup Verification](#prerequisites-setup-verification)
 - [Required Files and Structure](#required-files-and-structure)
 - [Environment Setup Checklist](#environment-setup-checklist)
 - [Components of the Preview Tool](#components-of-the-preview-tool)
 - [Basic Validation Steps](#basic-validation-steps)
- [Quick Diagnostic Workflow](#quick-diagnostic-workflow)
- [Detailed Problem Solutions](#detailed-problem-solutions)
 - [1. App Discovery & Indexing Issues](#1-app-discovery-indexing-issues)
 - [2. Manifest Configuration Problems](#2-manifest-configuration-problems)
 - [3. Embed Rendering Issues](#3-embed-rendering-issues)
 - [4. Wallet Connection Problems](#4-wallet-connection-problems)
 - [5. Gesture Conflicts and App Dismissal Issues](#5-gesture-conflicts-and-app-dismissal-issues)
 - [6. Mobile Testing & Debugging](#6-mobile-testing-debugging)
- [Advanced Troubleshooting](#advanced-troubleshooting)
- [Success Verification](#success-verification)
- [Getting Additional Help](#getting-additional-help)
- [Currently Unsupported](#currently-unsupported)
- [Base app Mini App SDK Supported Features](#base-app-mini-app-sdk-supported-features)
- [Base App Client Detection](#base-app-client-detection)
- [Supported Chains](#supported-chains)
- [How indexing works](#how-indexing-works)
 - [Step: Share your Mini App URL](#step-share-your-mini-app-url)
 - [Step: The Base app validates your manifest](#step-the-base-app-validates-your-manifest)
 - [Step: Your app enters the directory](#step-your-app-enters-the-directory)
- [How search works](#how-search-works)
- [Discovery surfaces](#discovery-surfaces)
 - [Category browsing](#category-browsing)
 - [Saved apps](#saved-apps)
 - [Direct messages](#direct-messages)
- [Related](#related)
- [GitHub Templates](#github-templates)
 - [Full Mini Demo](#full-mini-demo)
- [Getting Started](#getting-started)
 - [Step: Choose your template](#step-choose-your-template)
 - [Step: Fork or clone](#step-fork-or-clone)
 - [Step: Customize and deploy](#step-customize-and-deploy)
 - [More Mini App Resources](#more-mini-app-resources)
- [Mini Apps â€” Deep Guide for LLMs](#mini-apps-deep-guide-for-llms)
 - [What you can do here](#what-you-can-do-here)
- [Minimal Critical Code (MiniKit + OnchainKit wiring)](#minimal-critical-code-minikit-onchainkit-wiring)
- [Navigation (with brief descriptions)](#navigation-with-brief-descriptions)
 - [Introduction](#introduction)
 - [Quickstart](#quickstart)
 - [Design Guidelines](#design-guidelines)
 - [Growth Playbook](#growth-playbook)
 - [Features](#features)
 - [Troubleshooting](#troubleshooting)
 - [Technical Reference](#technical-reference)
- [Quickstart (excerpts)](#quickstart-excerpts)
- [Key Concepts (excerpts)](#key-concepts-excerpts)
- [Authentication Best Practices (excerpts)](#authentication-best-practices-excerpts)
- [API and Schemas (pruned)](#api-and-schemas-pruned)
- [Examples (common flows)](#examples-common-flows)
- [Introduction](#introduction)
- [What is a Base Account?](#what-is-a-base-account)
- [Why should developers care?](#why-should-developers-care)
- [Next steps](#next-steps)
- [1. Install the SDK (Optional)](#1-install-the-sdk-optional)
 - [Option A: CDN (No installation required)](#option-a-cdn-no-installation-required)
 - [Option B: NPM Package](#option-b-npm-package)
- [2. Copy-paste this HTML file](#2-copy-paste-this-html-file)
- [3. Serve the file](#3-serve-the-file)
- [Next steps](#next-steps)
- [1. Create a new Next.js app](#1-create-a-new-nextjs-app)
- [2. Install the SDK](#2-install-the-sdk)
- [3. Create the main component](#3-create-the-main-component)
- [4. Start your app](#4-start-your-app)
- [Next steps](#next-steps)
- [Before You Start](#before-you-start)
- [Step 1: Install Mobile Wallet Protocol Client](#step-1-install-mobile-wallet-protocol-client)
- [Step 2: Add Polyfills](#step-2-add-polyfills)
 - [Install peer dependencies](#install-peer-dependencies)
 - [Polyfills](#polyfills)
- [Step 3: Usage](#step-3-usage)
 - [Option 1: EIP-1193 Provider](#option-1-eip-1193-provider)
 - [Option 2: Wagmi Connector](#option-2-wagmi-connector)
- [Give feedback!](#give-feedback)
- [Guides](#guides)
- [Why wallet signatures instead of passwords?](#why-wallet-signatures-instead-of-passwords)
- [High-level flow](#high-level-flow)
- [Implementation](#implementation)
 - [Install Dependencies](#install-dependencies)
 - [Code Snippets](#code-snippets)
 - [Example Express Server](#example-express-server)
- [Add the Base Sign In With Base Button](#add-the-base-sign-in-with-base-button)
- [Why Base Pay?](#why-base-pay)
- [Client-side (Browser SDK)](#client-side-browser-sdk)
 - [Collect user information (optional)](#collect-user-information-optional)
- [Polling example](#polling-example)
- [Add the Base Pay Button](#add-the-base-pay-button)
- [Test on Base Sepolia](#test-on-base-sepolia)
- [Start accepting recurring payments with Base Pay Subscriptions](#start-accepting-recurring-payments-with-base-pay-subscriptions)
- [How It Works](#how-it-works)
 - [Step: User Approves Subscription](#step-user-approves-subscription)
 - [Step: Application Charges Periodically](#step-application-charges-periodically)
 - [Step: Smart Period Management](#step-smart-period-management)
 - [Step: User Maintains Control](#step-user-maintains-control)
- [Implementation Guide](#implementation-guide)
 - [Architecture Overview](#architecture-overview)
 - [Setup: Create Your Subscription Owner Wallet](#setup-create-your-subscription-owner-wallet)
 - [Client-Side: Create Subscriptions](#client-side-create-subscriptions)
 - [Server-Side: Charge Subscriptions](#server-side-charge-subscriptions)
 - [Server-Side: Revoke Subscriptions](#server-side-revoke-subscriptions)
 - [Fund Management](#fund-management)
 - [Testing on Testnet](#testing-on-testnet)
- [Network and Token Support](#network-and-token-support)
- [Advanced Topics](#advanced-topics)
 - [Custom Transaction Handling](#custom-transaction-handling)
- [API Reference](#api-reference)
- [Installation](#installation)
- [Setup](#setup)
 - [Initialize the SDK](#initialize-the-sdk)
- [Basic Batch Transaction](#basic-batch-transaction)
 - [Simple Multiple Transfers](#simple-multiple-transfers)
- [Contract Interactions](#contract-interactions)
 - [ERC-20 Approve and Transfer](#erc-20-approve-and-transfer)
- [Advanced Features](#advanced-features)
 - [Checking Wallet Capabilities](#checking-wallet-capabilities)
 - [Non-Atomic Batching](#non-atomic-batching)
- [Error Handling](#error-handling)
- [Implementation Guide](#implementation-guide)
 - [Step: Set up your Paymaster service](#step-set-up-your-paymaster-service)
 - [Step: Setup Base Account SDK](#step-setup-base-account-sdk)
 - [Step: Send transactions with Paymaster service capability](#step-send-transactions-with-paymaster-service-capability)
- [What are Sub Accounts?](#what-are-sub-accounts)
- [Key Benefits](#key-benefits)
- [Installation](#installation)
- [Quickstart](#quickstart)
- [Using Sub Accounts](#using-sub-accounts)
 - [Initialize the SDK](#initialize-the-sdk)
 - [Create a Sub Account](#create-a-sub-account)
 - [Get Existing Sub Account](#get-existing-sub-account)
 - [Send transactions](#send-transactions)
- [Advanced Usage](#advanced-usage)
 - [Import an existing account](#import-an-existing-account)
 - [Add Owner Account](#add-owner-account)
- [Auto Spend Permissions](#auto-spend-permissions)
 - [How it works](#how-it-works)
 - [Configuration](#configuration)
- [Technical Details](#technical-details)
- [Complete Integration Example](#complete-integration-example)
- [Overview](#overview)
- [Usage](#usage)
 - [Request a Spend Permission](#request-a-spend-permission)
 - [Use the Spend Permission](#use-the-spend-permission)
 - [Revoke a Spend Permission](#revoke-a-spend-permission)
- [API Reference](#api-reference)
- [Complete Integration Example](#complete-integration-example)
- [Example Use Case](#example-use-case)
- [Why it matters](#why-it-matters)
 - [What the code does](#what-the-code-does)
- [Base Pay integrates Magic Spend by default](#base-pay-integrates-magic-spend-by-default)
- [Next steps](#next-steps)
- [Overview](#overview)
- [Introduction](#introduction)
 - [Use Cases for Wallet Signatures](#use-cases-for-wallet-signatures)
 - [Smart Contract Wallet Differences](#smart-contract-wallet-differences)
- [High-level flow](#high-level-flow)
- [Implementation](#implementation)
 - [Code Snippets](#code-snippets)
- [Example Express Server](#example-express-server)
- [Best Practices](#best-practices)
 - [Domain Separation](#domain-separation)
 - [Nonce Management](#nonce-management)
 - [Expiry Times](#expiry-times)
 - [Choose a paymaster service provider](#choose-a-paymaster-service-provider)
 - [App setup for custom token](#app-setup-for-custom-token)
 - [ERC20 Compatible Paymasters](#erc20-compatible-paymasters)
- [FRAMEWORK INTEGRATIONS](#framework-integrations)
- [Overview](#overview)
- [Installation](#installation)
- [Configuration](#configuration)
 - [1. Configure Wagmi with Base Account](#1-configure-wagmi-with-base-account)
 - [2. Wrap Your App](#2-wrap-your-app)
- [Next Steps](#next-steps)
- [Prerequisites](#prerequisites)
- [Overview](#overview)
- [Implementation](#implementation)
 - [Code Snippets](#code-snippets)
 - [3. Using the Pre-built Button Component](#3-using-the-pre-built-button-component)
- [Implementation](#implementation)
- [Quick Example](#quick-example)
- [Learn More](#learn-more)
- [Overview](#overview)
- [Usage](#usage)
- [Prerequisites](#prerequisites)
- [Getting the Provider](#getting-the-provider)
- [Available Use Cases](#available-use-cases)
 - [Sub Accounts](#sub-accounts)
 - [Spend Permissions](#spend-permissions)
 - [Batch Transactions](#batch-transactions)
 - [Gasless Transactions](#gasless-transactions)
 - [Full list of provider methods and capabilities](#full-list-of-provider-methods-and-capabilities)
- [Overview](#overview)
 - [What you'll achieve](#what-youll-achieve)
- [Installation](#installation)
 - [1. Create a new Next.js project](#1-create-a-new-nextjs-project)
 - [2. Override the Base Account SDK version](#2-override-the-base-account-sdk-version)
 - [3. Install the dependencies](#3-install-the-dependencies)
- [Configuration](#configuration)
 - [1. Set up Environment Variables](#1-set-up-environment-variables)
 - [2. Configure Privy Provider](#2-configure-privy-provider)
- [Usage](#usage)
 - [1. Update the App Page](#1-update-the-app-page)
 - [2. Run the project locally](#2-run-the-project-locally)
 - [3. Get the Base Account SDK instance (Optional)](#3-get-the-base-account-sdk-instance-optional)
- [Overview](#overview)
- [Authentication Flow](#authentication-flow)
- [Custom Authentication](#custom-authentication)
 - [Setup](#setup)
 - [Frontend Component (Sign In With Base)](#frontend-component-sign-in-with-base)
 - [Using the Authentication Component](#using-the-authentication-component)
 - [Backend Implementation](#backend-implementation)
 - [Production Considerations](#production-considerations)
- [Overview](#overview)
 - [What you'll achieve](#what-youll-achieve)
- [Implementation](#implementation)
 - [Component Setup](#component-setup)
 - [Wallet Actions](#wallet-actions)
- [Explore further](#explore-further)
- [Overview](#overview)
 - [What you'll achieve](#what-youll-achieve)
- [Setup](#setup)
- [Implementation](#implementation)
 - [Component Setup](#component-setup)
 - [Key Methods](#key-methods)
 - [Network Configuration](#network-configuration)
 - [Explore further](#explore-further)
- [Overview](#overview)
- [What you'll build](#what-youll-build)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Step-by-step implementation](#step-by-step-implementation)
 - [Step 1: Environment configuration](#step-1-environment-configuration)
 - [Step 2: Configure Wagmi for Base Account support](#step-2-configure-wagmi-for-base-account-support)
 - [Step 3: Set up application providers](#step-3-set-up-application-providers)
 - [Step 4: Create unified authentication hook](#step-4-create-unified-authentication-hook)
 - [Step 5: Build authentication component](#step-5-build-authentication-component)
 - [Step 6: Handle transactions for each wallet type](#step-6-handle-transactions-for-each-wallet-type)
 - [Step 7: Complete your app](#step-7-complete-your-app)
- [Troubleshooting](#troubleshooting)
 - [Common Issues](#common-issues)
- [Enhanced integration coming soon](#enhanced-integration-coming-soon)
- [Resources](#resources)
- [Overview](#overview)
 - [What you'll achieve](#what-youll-achieve)
- [Installation](#installation)
- [Get Your Reown Project ID](#get-your-reown-project-id)
- [Configuration](#configuration)
 - [1. Configure Wagmi with RainbowKit](#1-configure-wagmi-with-rainbowkit)
 - [2. Set up RainbowKit Provider](#2-set-up-rainbowkit-provider)
- [Usage](#usage)
 - [Option 1: Using ConnectButton](#option-1-using-connectbutton)
 - [Option 2: Using WalletButton for Base Account](#option-2-using-walletbutton-for-base-account)
- [Advanced Configuration](#advanced-configuration)
 - [Prioritize Base Account in Wallet List](#prioritize-base-account-in-wallet-list)
 - [Customize RainbowKit Theme](#customize-rainbowkit-theme)
 - [Access Wallet Connection State](#access-wallet-connection-state)
 - [Switch Networks Programmatically](#switch-networks-programmatically)
- [Best Practices](#best-practices)
- [Next Steps](#next-steps)
- [REFERANCE](#referance)
- [Parameters](#parameters)
- [Returns](#returns)
- [Integration Examples](#integration-examples)
 - [With Viem](#with-viem)
 - [With Wagmi](#with-wagmi)
- [Configuration Options](#configuration-options)
 - [Sub-Account Configuration](#sub-account-configuration)
 - [Attribution](#attribution)
 - [Paymaster Integration](#paymaster-integration)
- [Error Handling](#error-handling)
- [TypeScript Support](#typescript-support)
- [Base Pay](#base-pay)
- [Parameters](#parameters)
- [Returns](#returns)
- [Errors](#errors)
- [Error Handling](#error-handling)
- [Parameters](#parameters)
- [Returns](#returns)
- [Error Handling](#error-handling)
- [Usage](#usage)
- [Returns](#returns)
- [Integration Examples](#integration-examples)
 - [With Viem](#with-viem)
 - [With Wagmi](#with-wagmi)
 - [Direct Provider Usage](#direct-provider-usage)
- [Event Handling](#event-handling)
- [Error Handling](#error-handling)
- [Provider Configuration](#provider-configuration)
- [TypeScript Support](#typescript-support)
- [Parameters](#parameters)
- [Returns](#returns)
- [Error Handling](#error-handling)
- [Integration with Sub Accounts](#integration-with-sub-accounts)
- [Error Handling](#error-handling)
- [Security Considerations](#security-considerations)
- [Parameters](#parameters)
- [Returns](#returns)
- [Get or Create Pattern](#get-or-create-pattern)
- [Storage Behavior](#storage-behavior)
- [Error Handling](#error-handling)
- [Key Lifecycle Management](#key-lifecycle-management)
- [Security Considerations](#security-considerations)
- [Parameters](#parameters)
- [Returns](#returns)
- [Error Handling](#error-handling)
- [Account State Management](#account-state-management)
- [Integration with Provider](#integration-with-provider)
- [Account Verification](#account-verification)
- [PROVIDER](#provider)
- [Specification](#specification)
 - [Example](#example)
- [Request Handling](#request-handling)
 - [1. Sent to the Wallet application](#1-sent-to-the-wallet-application)
 - [2. Handled Locally by the SDK](#2-handled-locally-by-the-sdk)
 - [3. Passed to RPC Provider](#3-passed-to-rpc-provider)
- [Parameters](#parameters)
- [Returns](#returns)
- [Error Handling](#error-handling)
- [Usage with Capabilities](#usage-with-capabilities)
- [Parameters](#parameters)
- [Returns](#returns)
- [Example Usage](#example-usage)
- [Error Handling](#error-handling)
- [Parameters](#parameters)
- [Returns](#returns)
- [Example Usage](#example-usage)
- [Status Code Reference](#status-code-reference)
- [Error Handling](#error-handling)
- [Usage with wallet\_sendCalls](#usage-with-walletsendcalls)
- [Parameters](#parameters)
- [Returns](#returns)
- [Example Usage](#example-usage)
- [Capability Detection Patterns](#capability-detection-patterns)
 - [Check Single Capability](#check-single-capability)
 - [Check Multiple Capabilities](#check-multiple-capabilities)
 - [Conditional Transaction Building](#conditional-transaction-building)
- [Error Handling](#error-handling)
- [Integration with Other Methods](#integration-with-other-methods)
 - [With wallet\_sendCalls](#with-walletsendcalls)
 - [With wallet\_connect](#with-walletconnect)
- [Best Practices](#best-practices)
- [Related Documentation](#related-documentation)
- [Parameters](#parameters)
- [Returns](#returns)
- [Error Handling](#error-handling)
- [Parameters](#parameters)
- [Returns](#returns)
- [Error Handling](#error-handling)
- [CAPABILITIES](#capabilities)
- [Core Concepts](#core-concepts)
 - [Discovery Pattern](#discovery-pattern)
- [Available Capabilities](#available-capabilities)
- [Using with wallet\_connect](#using-with-walletconnect)
 - [Basic Connection](#basic-connection)
 - [Authentication with signInWithEthereum](#authentication-with-signinwithethereum)
- [Using with wallet\_sendCalls](#using-with-walletsendcalls)
 - [Basic Transaction](#basic-transaction)
 - [Gasless Transactions with Paymaster](#gasless-transactions-with-paymaster)
 - [Atomic Batch Transactions](#atomic-batch-transactions)
- [Capability Detection Patterns](#capability-detection-patterns)
 - [Check Single Capability](#check-single-capability)
 - [Check Multiple Capabilities](#check-multiple-capabilities)
- [Capability-Specific Guides](#capability-specific-guides)
- [Related Methods](#related-methods)
- [Parameters](#parameters)
- [Returns](#returns)
- [Usage with wallet\_connect](#usage-with-walletconnect)
- [Security Considerations](#security-considerations)
 - [Nonce Management](#nonce-management)
 - [Backend Verification](#backend-verification)
- [Integration Examples](#integration-examples)
 - [Express.js Backend](#expressjs-backend)
 - [React Integration](#react-integration)
- [Error Handling](#error-handling)
- [Best Practices](#best-practices)
- [Parameters](#parameters)
- [Returns](#returns)
- [Example Usage](#example-usage)
- [Error Handling](#error-handling)
- [Use Cases](#use-cases)
 - [DeFi Operations](#defi-operations)
 - [NFT Minting with Payment](#nft-minting-with-payment)
- [Error Handling](#error-handling)
- [Relationship with EIP-7702](#relationship-with-eip-7702)
- [Best Practices](#best-practices)
- [Parameters](#parameters)
- [Returns](#returns)
- [Example Usage](#example-usage)
- [Error Handling](#error-handling)
- [Potential Use Cases](#potential-use-cases)
 - [E-commerce Transactions](#e-commerce-transactions)
 - [DeFi Operations with Fallbacks](#defi-operations-with-fallbacks)
 - [Batch Operations with Error Recovery](#batch-operations-with-error-recovery)
- [Checking Capability Support](#checking-capability-support)
- [Expected Benefits](#expected-benefits)
- [Development Status](#development-status)
- [Preparing for Flow Control](#preparing-for-flow-control)
- [Related Capabilities](#related-capabilities)
- [Parameters](#parameters)
- [Returns](#returns)
- [Example Usage](#example-usage)
- [Error Handling](#error-handling)
- [Paymaster Service Implementation](#paymaster-service-implementation)
 - [1. Gas Estimation Endpoint](#1-gas-estimation-endpoint)
 - [2. Paymaster Data Endpoint](#2-paymaster-data-endpoint)
- [Complete Example](#complete-example)
- [Error Handling](#error-handling)
- [Use Cases](#use-cases)
 - [Gaming Applications](#gaming-applications)
 - [DeFi Onboarding](#defi-onboarding)
- [Best Practices](#best-practices)
- [Parameters](#parameters)
- [Returns](#returns)
- [Example Usage](#example-usage)
- [Error Handling](#error-handling)
- [Wallet Implementation](#wallet-implementation)
- [App Behavior](#app-behavior)
 - [Without Auxiliary Funds](#without-auxiliary-funds)
 - [With Auxiliary Funds Support](#with-auxiliary-funds-support)
- [Use Cases](#use-cases)
 - [DeFi Applications](#defi-applications)
 - [E-commerce Applications](#e-commerce-applications)
 - [Gaming Applications](#gaming-applications)
- [Error Handling](#error-handling)
- [Best Practices](#best-practices)
- [Related Capabilities](#related-capabilities)
- [Overview](#overview)
- [Supported Data Types](#supported-data-types)
- [Data Object Types](#data-object-types)
 - [Name Object](#name-object)
 - [Physical Address Object](#physical-address-object)
 - [Phone Number Object](#phone-number-object)
- [Request Format](#request-format)
- [Callback API](#callback-api)
- [Response Format](#response-format)
 - [1. Success Response](#1-success-response)
 - [2. Error Response](#2-error-response)
- [Example Implementation](#example-implementation)
- [Important Notes](#important-notes)
- [UI ELEMENTS](#ui-elements)
- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Props](#props)
 - [paymentOptions (required)](#paymentoptions-required)
 - [Styling Props](#styling-props)
 - [Event Handlers](#event-handlers)
- [Payment Options](#payment-options)
 - [Basic Payment](#basic-payment)
 - [Payment with User Info Collection](#payment-with-user-info-collection)
- [Styling Options](#styling-options)
 - [Color Schemes](#color-schemes)
 - [Sizes and Variants](#sizes-and-variants)
- [Event Handling](#event-handling)
 - [Payment Result Handling](#payment-result-handling)
 - [Custom Click Handler](#custom-click-handler)
- [Complete Example](#complete-example)
- [TypeScript Support](#typescript-support)
- [Testing](#testing)
- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Props](#props)
 - [Styling Props](#styling-props)
 - [Event Handlers](#event-handlers)
- [Styling Options](#styling-options)
 - [Alignment](#alignment)
 - [Variants](#variants)
 - [Color Schemes](#color-schemes)
 - [Sizes](#sizes)
- [Authentication Flow Integration](#authentication-flow-integration)
 - [Complete Authentication Example](#complete-authentication-example)
 - [SIWE Integration](#siwe-integration)
- [Custom Button States](#custom-button-states)
 - [Loading State](#loading-state)
 - [Error State Handling](#error-state-handling)
- [Integration with Authentication Providers](#integration-with-authentication-providers)
 - [NextAuth.js Integration](#nextauthjs-integration)
- [TypeScript Support](#typescript-support)
- [Best Practices](#best-practices)
- [Sign in With Base & Base Pay](#sign-in-with-base-base-pay)
- [Sign in with Base](#sign-in-with-base)
 - [Best Practices](#best-practices)
 - [Design & Brand Guidelines](#design-brand-guidelines)
 - [Examples](#examples)
 - [Creating a custom button](#creating-a-custom-button)
- [Base Pay](#base-pay)
- [Media Assets](#media-assets)
- [ONCHAIN CONTRACTS](#onchain-contracts)
 - [Structs](#structs)
 - [Contract functions](#contract-functions)
 - [Why Are We Collecting Telemetry?](#why-are-we-collecting-telemetry)
 - [What Data Will Be Collected?](#what-data-will-be-collected)
 - [How Does It Work?](#how-does-it-work)
 - [How Do I Opt Out?](#how-do-i-opt-out)
- [Overview](#overview)
- [Changes to user experience when click "Coinbase Wallet"](#changes-to-user-experience-when-click-coinbase-wallet)
- [How to migrate?](#how-to-migrate)
- [BASENAMES](#basenames)
- [FAQ](#faq)
 - [1. What are Basenames?](#1-what-are-basenames)
 - [2. What are the Basename registration fees?](#2-what-are-the-basename-registration-fees)
 - [3. How do I get a free or discounted Basename?](#3-how-do-i-get-a-free-or-discounted-basename)
 - [4. Why is there an auction at launch, and how does it work?](#4-why-is-there-an-auction-at-launch-and-how-does-it-work)
 - [5. Do I have to pay gas to register a Basename?](#5-do-i-have-to-pay-gas-to-register-a-basename)
 - [6. How long can I register a Basename for?](#6-how-long-can-i-register-a-basename-for)
 - [7. How can I use my Basename?](#7-how-can-i-use-my-basename)
 - [8. Is my profile information published onchain?](#8-is-my-profile-information-published-onchain)
 - [9. How do I set my Basename as my primary name for my address?](#9-how-do-i-set-my-basename-as-my-primary-name-for-my-address)
 - [10. How do I transfer my Basename to another address?](#10-how-do-i-transfer-my-basename-to-another-address)
 - [11. What happens if I forget to renew my Basename?](#11-what-happens-if-i-forget-to-renew-my-basename)
 - [12. What happens if a Basename is not renewed during the grace period?](#12-what-happens-if-a-basename-is-not-renewed-during-the-grace-period)
 - [13. Can I link multiple addresses to my Basename?](#13-can-i-link-multiple-addresses-to-my-basename)
 - [14. I am a builder. How do I integrate Basenames to my app?](#14-i-am-a-builder-how-do-i-integrate-basenames-to-my-app)
 - [15. How do I get a Basename for my app or project?](#15-how-do-i-get-a-basename-for-my-app-or-project)
 - [16. How are Basenames built?](#16-how-are-basenames-built)
 - [17. Do Basenames work on different chains?](#17-do-basenames-work-on-different-chains)
- [Transferring Your Basename to Your New Wallet](#transferring-your-basename-to-your-new-wallet)
 - [Before You Start](#before-you-start)
 - [Step-by-Step Transfer Process](#step-by-step-transfer-process)
 - [After the Transfer](#after-the-transfer)
 - [What This Transfer Includes](#what-this-transfer-includes)
 - [Need Help?](#need-help)
- [Objectives](#objectives)
 - [Update Wagmi config](#update-wagmi-config)
- [BASE APP](#base-app)
- [Introduction](#introduction)
- [What is Base App](#what-is-base-app)
- [Who can participate in the beta?](#who-can-participate-in-the-beta)
- [How do I get access to the beta app?](#how-do-i-get-access-to-the-beta-app)
- [Basenames](#basenames)
- [Wallet and Funds](#wallet-and-funds)
 - [I logged into the beta, but don’t see my funds from my previous Coinbase Wallet.](#i-logged-into-the-beta-but-dont-see-my-funds-from-my-previous-coinbase-wallet)
 - [Smart Wallet](#smart-wallet)
 - [Common Issues](#common-issues)
- [Farcaster Integration](#farcaster-integration)
- [Beta Management](#beta-management)
 - [Toggling Beta Mode](#toggling-beta-mode)
 - [Additional Questions](#additional-questions)
- [Launch Timeline](#launch-timeline)
- [Chat Agents](#chat-agents)
- [Why agents?](#why-agents)
- [XMTP Documentation](#xmtp-documentation)
- [Build a high quality foundation](#build-a-high-quality-foundation)
 - [Responding to messages](#responding-to-messages)
 - [Group Chat Etiquette](#group-chat-etiquette)
 - [Communication Style](#communication-style)
- [Craft compelling onboarding](#craft-compelling-onboarding)
 - [Great Onboarding Message Structure](#great-onboarding-message-structure)
 - [Example: High-Quality Onboarding](#example-high-quality-onboarding)
 - [Example: Poor Onboarding](#example-poor-onboarding)
- [Showcase unique value](#showcase-unique-value)
 - [Solve Real Problems](#solve-real-problems)
 - [Enable User Success](#enable-user-success)
 - [Design for Engagement](#design-for-engagement)
 - [Continuous Engagement Strategy](#continuous-engagement-strategy)
 - [Examples of Engagement Features](#examples-of-engagement-features)
- [Installation](#installation)
- [Usage](#usage)
 - [Set environment variables](#set-environment-variables)
- [Get a basename for your agent](#get-a-basename-for-your-agent)
- [COOKBOOK](#cookbook)
- [Use Cases](#use-cases)
- [Objectives](#objectives)
- [Prerequisites](#prerequisites)
- [Set Up a Base Paymaster & Bundler](#set-up-a-base-paymaster-bundler)
 - [Screenshots](#screenshots)
 - [Allowlist a Sponsorable Contract](#allowlist-a-sponsorable-contract)
 - [Global & Per User Limits](#global-per-user-limits)
- [Test Your Paymaster Policy](#test-your-paymaster-policy)
 - [Installing Foundry](#installing-foundry)
 - [Create Your Project & Generate Key Pairs](#create-your-project-generate-key-pairs)
 - [Project Structure With Environment Variables](#project-structure-with-environment-variables)
- [Example `index.js`](#example-indexjs)
- [Hitting Policy Limits & Troubleshooting](#hitting-policy-limits-troubleshooting)
- [Verifying Token Ownership (Optional)](#verifying-token-ownership-optional)
- [Conclusion](#conclusion)
- [References](#references)
- [Foundations](#foundations)
- [Vibe Coding Elements](#vibe-coding-elements)
 - [Step: Plan](#step-plan)
 - [Step: UX + Architecture](#step-ux-architecture)
 - [Step: Build the Core Features](#step-build-the-core-features)
 - [Step: Test & Refine](#step-test-refine)
 - [Step: Deploy & Share](#step-deploy-share)
- [What makes a good prompt](#what-makes-a-good-prompt)
- [What makes a prompt effective](#what-makes-a-prompt-effective)
- [Additional Resources](#additional-resources)
- [Example Prompt for Understanding Key Tools](#example-prompt-for-understanding-key-tools)
 - [Used tailored prompts](#used-tailored-prompts)
 - [Use Screenshots](#use-screenshots)
 - [Use code snippets](#use-code-snippets)
 - [Step: Audit Connect Walet touchpoints](#step-audit-connect-walet-touchpoints)
 - [Step: Adopt OnchainKit where it fits](#step-adopt-onchainkit-where-it-fits)
 - [Step: Implement Paymaster](#step-implement-paymaster)
 - [Step: Use Batched Transactions](#step-use-batched-transactions)
- [GOAL](#goal)
- [SCREENS](#screens)
- [COMPONENTS](#components)
- [UX & STYLE](#ux-style)
- [DELIVERABLES](#deliverables)
<!-- /TOC -->

## INTRODUCTION

# Base

> The #1 Ethereum Layer 2, incubated by Coinbase

Build on Base and choose the features that fits your needs — from sub-cent global payments to creator-first monetization and built-in distribution.

## Why Base?

## Global Economy
Payments & Financial Services: Move value globally with sub-second, sub-cent payments and build on existing financial services for trading, yield generation, and more.

## Creator Tools
Creator Monetization: Creators of all kinds are exploring new ways to monetize their work. Innovate on the frontier of creator monetization with the creator economy on Base.

## Builder Experience
Comprehensive Builder Support: Base provides developer tools, infrastructure, and support. Plus, Base has one of the largest onchain builder communities within which you can collaborate and grow.

## Distribution
Launch to real users: Tap Base activations, grants, and mini-app channels that surface your project to millions.

## Start Building

# Build an App

> A guide to building a next.js app on Base using OnchainKit

Welcome to the Base quickstart guide! In this walkthrough, we'll create a simple onchain app from start to finish. Whether you're a seasoned developer or just starting out, this guide has got you covered.

## What You'll Achieve

By the end of this quickstart, you'll have built an onchain app by:

* Configuring your development environment
* Deploying your smart contracts to Base
* Interacting with your deployed contracts from the frontend

Our simple app will be an onchain tally app which lets you add to a total tally, stored onchain, by pressing a button.


> Note:
**Why Base?**

 Base is a fast, low-cost, builder-friendly Ethereum L2 built to bring the next billion users onchain. By following this guide, you'll join a vibrant ecosystem of developers, creators, and innovators who are building a global onchain economy.

## Set Up Your Development Environment


### Step: Bootstrap with OnchainKit
OnchainKit is a library of ready-to-use React components and Typescript utilities for building onchain apps. Run the following command in your terminal and follow the prompts to bootstrap your project.
#### Command
```bash
npm create onchain@latest
```The prompts will ask you for a CDP API Key which you can get [Client Key](https://portal.cdp.coinbase.com/projects/api-keys/client-key)

 Once you've gone through the prompts, you'll have a new project directory with a basic OnchainKit app. Run the following to see it live.
#### Command```bash
cd my-onchainkit-app
npm install
npm run dev
```You should see the following screen.

 ![OnchainKit Template](https://mintcdn.com/base-a060aa97/-q4fo0uzIfxlH3Wn/images/onchainkit/quickstart.png?fit=max&auto=format&n=-q4fo0uzIfxlH3Wn&q=85&s=6946afe49fc15f2bac953a56a942c114)
 Once we've deployed our contracts, we'll add a button that lets us interact with our contracts.

### Step: Install and initialize Foundry
The total tally will be stored onchain in a smart contract. We'll use the Foundry framework to deploy our contract to the Base Sepolia testnet.

 1. Create a new "contracts" folder in the root of your project
#### Command```bash
mkdir contracts && cd contracts
```2. Install and initialize Foundry
#### Command```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
forge init --no-git
```Open the project and find the`Counter.sol`contract file in the`/contracts/src`folder. You'll find the simple logic for our tally app.


> Note:
**--no-git**

 Because`contracts`is a folder in our project, we don't want to initialize a separate git repository for it, so we add the`--no-git`flag.


### Step: Configure Foundry with Base
To deploy your smart contracts to Base, you need two key components:

 1. A node connection to interact with the Base network
 2. A funded private key to deploy the contract

 Let's set up both of these:

 * Create a`.env`file in your`contracts`directory and add the Base and Base Sepolia RPC URLs
#### Command```bash
BASE_RPC_URL="https://mainnet.base.org
BASE_SEPOLIA_RPC_URL="https://sepolia.base.org
```-Load your environment variables
#### Command```bash
source .env
```> Note:
**Base Sepolia**

 Base Sepolia is the test network for Base, which we will use for the rest of this guide. You can obtain free Base Sepolia ETH from one of the https://docs.base.org/base-chain/tools/network-faucets (/base-chain/tools/network-faucets).


### Step: Secure your private key
A private key with testnet funds is required to deploy the contract. You can generate a fresh private key https://visualkey.link/

 1. Store your private key in Foundry's secure keystore
#### Command```bash
cast wallet import deployer --interactive
```2. When prompted enter your private key and a password.

 Your private key is stored in`~/.foundry/keystores`which is not tracked by git.


> Warning:
Never share or commit your private key. Always keep it secure and handle with care.


## Deploy Your Contracts

Now that your environment is set up, let's deploy your contracts to Base Sepolia. The foundry project provides a deploy script that will deploy the Counter.sol contract.


### Step: Run the deploy script
1. Use the following command to compile and deploy your contract
#### Command```bash
forge create ./src/Counter.sol:Counter --rpc-url $BASE_SEPOLIA_RPC_URL --account deployer
```Note the format of the contract being deployed is`<contract-path>:<contract-name>`.

### Step: Save the contract address
After successful deployment, the transaction hash will be printed to the console output

 Copy the deployed contract address and add it to your `.env`file
#### Command```bash
COUNTER_CONTRACT_ADDRESS="0x..."
```### Step: Load the new environment variable
#### Command```bash
source .env
```### Step: Verify Your Deployment
To ensure your contract was deployed successfully:

 1. Check the transaction on [Sepolia Basescan](https://sepolia.basescan.org/)
 2. Use the`cast`command to interact with your deployed contract from the command line
#### Command```bash
cast call $COUNTER_CONTRACT_ADDRESS "number(uint256)" --rpc-url $BASE_SEPOLIA_RPC_URL
```This will return the initial value of the Counter contract's`number`storage variable, which will be`0`.

**Congratulations! You've deployed your smart contract to Base Sepolia!**

Now lets connect the frontend to interact with your recently deployed contract.

## Interacting with your contract

To interact with the smart contract logic, we need to submit an onchain transaction. We can do this easily with the `Transaction`component. This is a simplified version of the`Transaction`component, designed to streamline the integration process. Instead of manually defining each subcomponent and prop, we can use this shorthand version which renders our suggested implementation of the component and includes the`TransactionButton`and`TransactionToast`components.


### Step: Add the Transaction component
Lets add the`Transaction`component to our`page.tsx`file. Delete the existing content in the`main`tag and replace it with the snippet below.
#### Code```tsx
// @noErrors: 2307 - Cannot find module '@/calls'
import { Transaction } from '@coinbase/onchainkit/transaction';
import { calls } from '@/calls';

<main className="flex flex-grow items-center justify-center">
 <div className="w-full max-w-4xl p-4">
<div className="mx-auto mb-6 w-1/3">
 <Transaction calls={calls} />
</div>
 </div>
</main>;
```### Step: Defining the contract calls
In the previous code snippet, you'll see we imported`calls`from the`calls.ts`file. This file provides the details needed to interact with our contract and call the`increment`function. Create a new`calls.ts`file in the same folder as your`page.tsx`file and add the following code.
#### Code```ts
const counterContractAddress = '0x...'; // add your contract address here
const counterContractAbi = [
 {
type: 'function',
name: 'increment',
inputs: [],
outputs: [],
stateMutability: 'nonpayable',
 },
] as const;

export const calls = [
 {
address: counterContractAddress,
abi: counterContractAbi,
functionName: 'increment',
args: [],
 },
];
```> Note:
**Contract Address**

 The`calls.ts`file contains the details of the contract interaction, including the contract address, which we saved in the previous step.


### Step: Testing the component
Now, when you connect a wallet and click on the`Transact`button and approve the transaction, it will increment the tally onchain by one.

 We can verify that the onchain count took place onchain by once again using`cast`to call the`number`function on our contract.
#### Command```bash
cast call $COUNTER_CONTRACT_ADDRESS "number(uint256)" --rpc-url $BASE_SEPOLIA_RPC_URL
```If the transaction was successful, the tally should have incremented by one!

We now have a working onchain tally app! While the example is simple, it illustrates the end to end process of building on onchain app. We:

* Configured a project with frontend and onchain infrastructure
* Deployed a smart contract to Base Sepolia
* Interacted with the contract from the frontend

## Further Improvements

This is just the beginning. There are many ways we can improve upon this app. For example, we could:

* Make the`increment`transaction gasless by integrating with Paymaster: https://docs.base.org/onchainkit/transaction/transaction#sponsor-with-paymaster-capabilities
* Improve the wallet connection and sign up flow with the WalletModal: https://docs.base.org/onchainkit/wallet/wallet-modal component
* Add onchain Identity: https://docs.base.org/onchainkit/identity/identity so we know who added the most recent tally

## PRODUCTS

## OnchainKit

# Getting Started

OnchainKit is your go-to SDK for building beautiful onchain applications. Ship in minutes, not weeks.

Anyone can build an onchain app in 15 minutes with OnchainKit. No blockchain experience required.

## Why OnchainKit?

OnchainKit streamlines app development by providing a comprehensive toolkit that combines powerful onchain features with developer-friendly design:

* **Ergonomic design:** Full-stack tools that make complex onchain interactions intuitive
* **Battle-tested patterns:** Industry best practices packaged into ready-to-use solutions
* **Purpose-built components:** Pre-built modules for common onchain workflows
* **Framework agnostic:** Compatible with any React-supporting framework
* **Supercharged by Base:** Deep integration with Base's protocol features and ecosystem

## Automatic Installation

We recommend starting a new OnchainKit app using`create onchain`, which sets up everything automatically for you. To create a project, run:
#### Command
```bash
npm create onchain@latest
```After the prompts,`create onchain` will create a folder with your project name and install the required dependencies.

You can also checkout our pre-built templates:

* [Onchain Commerce](https://onchain-commerce-template.vercel.app/)
* [NFT minting](https://ock-mint.vercel.app/)
* [Funding flow](https://github.com/fakepixels/fund-component)
* [Social profile](https://github.com/fakepixels/ock-identity)

<Check>
 These docs are LLM-friendly—reference [OnchainKit AI Prompting Guide](https://docs.base.org/onchainkit/guides/ai-prompting-guide) in your code editor to streamline builds and prompt smarter.
</Check>

## Manual Installation

Add OnchainKit to your existing project manually.
Next.js: https://docs.base.org/onchainkit/installation/nextjs
Vite: https://docs.base.org/onchainkit/installation/vite
Remix: https://docs.base.org/onchainkit/installation/remix
Astro: https://docs.base.org/onchainkit/installation/astro

## Testing Your OnchainKit App

Build reliable applications with comprehensive end-to-end testing using [OnchainTestKit](https://docs.base.org/onchainkit/guides/testing-with-onchaintestkit Test wallet connections, transactions, and complex user flows with automated browser testing.

## Start building!

Explore our ready-to-use onchain components:

* [**`Identity`**](https://docs.base.org/onchainkit/identity/identity) – Show [Basenames](https://docs.base.org/onchainkit/identity/identity [avatars](https://docs.base.org/onchainkit/identity/avatar [badges](https://docs.base.org/onchainkit/identity/badge and [addresses](https://docs.base.org/onchainkit/identity/address)
* [**`Wallet`**](https://docs.base.org/onchainkit/wallet/wallet) – Create or connect wallets with [Connect Wallet](https://docs.base.org/onchainkit/wallet/wallet)
* [**`Transaction`**](https://docs.base.org/onchainkit/transaction/transaction) – Handle [transactions](https://docs.base.org/onchainkit/transaction/transaction) using EOAs or Smart Wallets.
* [**`Checkout`**](https://docs.base.org/onchainkit/checkout/checkout) – Integrate USDC [checkout](https://docs.base.org/onchainkit/checkout/checkout) flows with ease.
* [**`Fund`**](https://docs.base.org/onchainkit/fund/fund-button) – Create a [funding](https://docs.base.org/onchainkit/fund/fund-button) flow to onboard users.
* [**`Tokens`**](https://docs.base.org/onchainkit/token/token-chip) – Search and display [tokens](https://docs.base.org/onchainkit/token/token-chip) with various components.
* [**`Swap`**](https://docs.base.org/onchainkit/swap/swap) – Enable [token swaps](https://docs.base.org/onchainkit/swap/swap) in your app.
* [**`Mint`**](https://docs.base.org/onchainkit/mint/nft-mint-card) – [View](https://docs.base.org/onchainkit/mint/nft-mint-card) and [Mint](https://docs.base.org/onchainkit/mint/nft-mint-card) NFTs in your app.

# Telemetry · OnchainKit

> Understanding OnchainKit's anonymous telemetry system and how to configure it.

OnchainKit is introducing an anonymous telemetry system to help us better understand how our library is used in the wild. Participation in this anonymous program is optional—if you'd prefer not to share any usage data, you can easily opt out.

### Why Are We Collecting Telemetry?

OnchainKit has quickly become a go-to full‑stack component library for integrating essential onchain functionality (like `<Wallet />`, `<Transaction />`, and `<Swap />`) in minutes. Until now, our usage insights have been limited to public npm download counts and API endpoint usage. By collecting telemetry data, we can:

* **Gauge Component Usage**: Understand which components (and their variants) are most popular
* **Data-Informed Improvements**: Help our data science team generate insights that drive future enhancements and refactoring decisions
* **Proactive Monitoring**: Quickly detect issues with new releases or API changes through a dedicated error event stream (with alerts to oncall engineers)

### What Data Will Be Collected?

Telemetry data is completely anonymous and designed to provide aggregated insights. Specifically, we collect:

* **Command Details**: Which commands (or component events) are being invoked (e.g. walletConnection, swapSuccess)
* **Version & App Info**: The OnchainKit version, app name (from window\.top.document.title), and origin (the app URL)
* **Usage Metrics**: Information such as the number of unique wallets, transactions, or contracts interacting with OnchainKit
* **Error Events**: Generic error events along with component context to help us triage any issues

No sensitive data—such as environment variables, file paths, or private keys—is ever collected.

### How Does It Work?

Telemetry is integrated directly into each applicable component via our new `sendAnalytics`function. When a component event occurs (e.g. a successful transaction or a wallet connection), this function automatically fires (provided analytics is enabled in your OnchainKit config).

For example, a telemetry event might be sent as follows:
#### Command```bash
curl -X POST https://api.developer.coinbase.com/rpc/analytics \
 -H "Content-Type: application/json" \
 -H "OnchainKit-Version: 0.37.0" \
 -H "OnchainKit-App-Name: My Example App" \
 -H "Origin: www.example-app.vercel.app" \
 -d '{
"eventType": "transactionSuccess",
"apiKey": "ozpCtG8CfD3TIod_1Va7UBsUm5Rn1",
"data": {
 "address": "0x...",
 "contract": "0x...",
 "transactionHash": "0x...",
 "sponsored": true
}
 }'
```### How Do I Opt Out?

By default, telemetry is opt‑out starting with version 0.37.0. If you'd like to disable telemetry, simply set the`analytics`flag to`false`in your OnchainKit configuration:
#### Code```tsx
// @noErrors: 2304
export function Providers(props: { children: ReactNode }) {
 return (
<OnchainKitProvider
 apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
 chain={base}
 config={{
analytics: false // [!code focus]
 }}
>
 {props.children}
</OnchainKitProvider>
 );
}
```You can also re‑enable analytics later by toggling this flag to`true`.

We believe that this telemetry initiative will help us make OnchainKit even better for all developers—by focusing our improvements on the most used features and catching issues early. If you have any questions or feedback, please reach out to the OnchainKit team.

Happy building!

— The OnchainKit core team

# Troubleshooting

This guide covers common issues you may encounter while using OnchainKit. If you don't find your issue here, try searching our [GitHub Issues](https://github.com/coinbase/onchainkit/issues) or joining our Discord Community.

## Common Issues

### Environment Setup

* **Missing API Key**

 * Error: "Project ID is required for this component"
 * Solution: Add your Client API Key to `.env`:
#### Env file
```dotenv
 NEXT_PUBLIC_CDP_API_KEY=YOUR_PUBLIC_API_KEY
```* **Invalid Environment Variables**

 * Error: "Cannot find environment variable"
 * Solution: Use the correct variable name for your framework:
 * Next.js:`NEXT_PUBLIC_CDP_API_KEY`* Vite:`VITE_PUBLIC_ONCHAINKIT_API_KEY`* Astro:`PUBLIC_ONCHAINKIT_API_KEY`* **Contracts Not Available**
 * Error: "Contracts are not available" or "Contracts not available for LifecycleStatus"
 * Solutions:
 * Verify`NEXT_PUBLIC_ONCHAINKIT_API_KEY`is set correctly
 * For Checkout component with`chargeHandler`, also set:
#### Env file
```dotenv
 NEXT_PUBLIC_COINBASE_COMMERCE_API_KEY=YOUR_COMMERCE_API_KEY
```* Ensure API keys are properly exposed in your environment

### Dependencies

* **Version Compatibility**
 * Issue: Unexpected behavior or type errors
 * Solution: Ensure compatible versions:
#### JSON```json
{
 "dependencies": {
"@coinbase/onchainkit": "latest",
"viem": "^2.0.0",
"@wagmi/core": "^2.0.0"
 }
}
```### Provider Configuration

* **Missing OnchainKitProvider**

 * Error: "OnchainKit context not found"
 * Solution: Wrap your app with OnchainKitProvider and [configure](/onchainkit/getting-started) properly:
#### Code```tsx
 import { OnchainKitProvider } from '@coinbase/onchainkit';
 import { base } from 'viem/chains';

 export default function App({ children }) {
return (
 <OnchainKitProvider
apiKey={process.env.NEXT_PUBLIC_CDP_API_KEY}
chain={base}
 >
{children}
 </OnchainKitProvider>
);
 }
```### Wallet Connection

* **Connection Failed**

 * Error: "Unable to connect wallet"
 * Solutions:
 * Verify wallet extension is installed and unlocked
 * Check [supported chains configuration](/onchainkit/wallet/wallet)
 * Ensure proper network selection in wallet
 * Verify RPC endpoints are accessible

* **Chain Switching Issues**
 * Error: "Failed to switch chain"
 * Solutions:
 * Verify chain ID is supported by OnchainKit
 * Check wallet has required permissions
 * Ensure RPC endpoints are configured correctly
 * Add chain to wallet if not already added

### Transaction Issues

* **Gas Estimation Failed**
 * Error: "Gas estimation failed"
 * Solutions:
 * Verify sufficient balance for gas
 * Check transaction parameters are valid
 * Ensure proper network [configuration](/onchainkit/transaction/transaction)

### Identity Components

### Theme Issues

* **Dark Mode Not Working**

 * Error: "Dark mode styles not applying"
 * Solution: Configure Tailwind and OnchainKit properly:
#### Code```js
 // tailwind.config.js
 module.exports = {
darkMode: ['class'],
safelist: ['dark'],
// ... rest of config
 }
```### React Native

* \*\* React Native Support \*\*
 * OnchainKit's components are not supported for use in React Native, however, you can use utility functions, like`getName`, as well as some hooks in your React Native app. When using these utility functions, you may need to import them directly rather than through the export file.
 * Example: `import { getName } from '@coinbase/onchainkit/esm/identity/utils/getName.js';`rather than`import { getName } from '@coinbase/onchainkit/identity;`### Module Resolution

* **Module Resolution Errors**
 * Error: "Cannot find module ... or its corresponding type declarations. Consider updating to 'node16', 'nodenext', or 'bundler'"
 * Solution: Update your Node.js version or use a compatible bundler. We recommend using Node 18+ and`"moduleResolution": "NodeNext"`for the best developer experience. OnchainKit supports only ES Modules and does not support CommonJS modules.

## Getting Help

Need more help?

* Discord Community
* [X/Twitter Support](https://x.com/onchainkit)
* [GitHub Issues](https://github.com/coinbase/onchainkit/issues)

# Next.js Installation · OnchainKit

> Install OnchainKit using Next.js

Install and configure OnchainKit with Next.js.
If you are integrating OnchainKit into an existing project,
skip to the [OnchainKit installation](#install-onchainkit).


### Step: Install Next.js
Create a new Next.js project by using the Next.js CLI.
 More information about Next.js can be found [Installation](https://nextjs.org/docs/getting-started/installation)
#### Command```bash
npx create-next-app@14
```During the setup process you will encounter multiple prompts.
 Make sure you enable TypeScript, ESLint, and Tailwind CSS.

### Step: Install OnchainKit
Install OnchainKit in your project.

 <CodeGroup>
#### Command```bash
 npm install @coinbase/onchainkit
```#### Command```bash
 yarn add @coinbase/onchainkit
```#### Command```bash
 pnpm add @coinbase/onchainkit
```#### Command```bash
 bun add @coinbase/onchainkit
```</CodeGroup>

### Step: Get Your Client API Key
Get your [Client API Key](https://portal.cdp.coinbase.com/projects/api-keys/client-key) from Coinbase Developer Platform.

 Create a`.env`file in your project's root directory.

 Add your Client API Key to the`.env`file:
#### Code```tsx
NEXT_PUBLIC_ONCHAINKIT_API_KEY=YOUR_CLIENT_API_KEY;
```### Step: Add Providers
Create a`providers.tsx`file. Add`OnchainKitProvider`with your desired config.

 Under the hood, OnchainKit will create our recommended Wagmi and QueryClient
 providers. If you wish to customize these providers, check out [Custom
 Supplemental Providers](/onchainkit/config/supplemental-providers).
#### Code```tsx
// @noErrors: 2307 2580 2339 - cannot find 'process', cannot find './wagmi', cannot find 'import.meta'
'use client';

import type { ReactNode } from 'react';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { base } from 'wagmi/chains'; // add baseSepolia for testing // [!code ++]

export function Providers(props: { children: ReactNode }) {
 return (
<OnchainKitProvider
 apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY} // [!code ++]
 chain={base} // add baseSepolia for testing // [!code ++]
>
 {props.children}
</OnchainKitProvider>
 );
}
```### Step: Wrap your app with <Providers />
After the setup, wrap your app with the above`<Providers />`component.```javascript
import './globals.css';
import { Providers } from './providers'; // [!code ++]

export default function RootLayout({
 children,
}: Readonly<{
 children: React.ReactNode,
}>) {
 return (
<html lang="en">
 <body>
<Providers>
 {children}
</Providers>
 </body>
</html>
 );
}
```### Step: Add Styles
OnchainKit components come with pre-configured styles. To include these styles in your project, add the following import statement at the top of this file:```javascript
import '@coinbase/onchainkit/styles.css';
```For example, if you're using Next.js with the app router, your`app/layout.tsx`might look like this:
#### Code```tsx
import '@coinbase/onchainkit/styles.css'; // [!code ++]
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { headers } from 'next/headers';
import { type ReactNode } from 'react';
import { cookieToInitialState } from 'wagmi';

import { getConfig } from '../wagmi';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
 title: 'Create Wagmi',
 description: 'Generated by create-wagmi',
};

export default function RootLayout(props: { children: ReactNode }) {
 const initialState = cookieToInitialState(
getConfig,
headers.get('cookie')
 );
 return (
<html lang="en">
 <body className={inter.className}>
<Providers initialState={initialState}>{props.children}</Providers>
 </body>
</html>
 );
}
````

This ensures that the OnchainKit styles are loaded and applied to your entire application.

- For Tailwind CSS users, check out our [Tailwind Integration Guide](/onchainkit/guides/tailwind).

- Update the appearance of components by using our built-in themes or crafting your own custom theme.
  Explore the possibilities in our [Theming Guide](/onchainkit/guides/themes).

## Start building!

Explore our ready-to-use onchain components:

- [**`Identity`**](/onchainkit/identity/identity) – Show [Basenames](/onchainkit/identity/identity), [avatars](/onchainkit/identity/avatar), [badges](/onchainkit/identity/badge), and [addresses](/onchainkit/identity/address).
- [**`Wallet`**](/onchainkit/wallet/wallet) – Create or connect wallets with [Connect Wallet](/onchainkit/wallet/wallet).
- [**`Transaction`**](/onchainkit/transaction/transaction) – Handle [transactions](/onchainkit/transaction/transaction) using EOAs or Smart Wallets.
- [**`Checkout`**](/onchainkit/checkout/checkout) – Integrate USDC [checkout](/onchainkit/checkout/checkout) flows with ease.
- [**`Fund`**](/onchainkit/fund/fund-button) – Create a [funding](/onchainkit/fund/fund-button) flow to onboard users.
- [**`Tokens`**](/onchainkit/token/token-chip) – Search and display [tokens](/onchainkit/token/token-chip) with various components.
- [**`Swap`**](/onchainkit/swap/swap) – Enable [token swaps](/onchainkit/swap/swap) in your app.
- [**`Mint`**](/onchainkit/mint/nft-mint-card) – [View](/onchainkit/mint/nft-mint-card) and [Mint](/onchainkit/mint/nft-mint-card) NFTs in your app.

# Vite Installation · OnchainKit

> Install OnchainKit using Vite

Install and configure OnchainKit with Vite.
If you are integrating OnchainKit into an existing project,
skip to the [OnchainKit installation](#install-onchainkit).

### Step: Install Vite

Create a new Vite project by using the Vite CLI.
More information about Vite can be found [Guide](https://vite.dev/guide/#scaffolding-your-first-vite-project)

 <CodeGroup>
#### Command
```bash
 npm create vite@latest
```#### Command```bash
 yarn create vite
```#### Command```bash
 pnpm create vite
```#### Command```bash
 bun create vite
```</CodeGroup>

During the setup process you will encounter multiple prompts.
Make sure you select React and TypeScript.

### Step: Install OnchainKit

Add OnchainKit to your project by installing the`@coinbase/onchainkit`package.

 <CodeGroup>
#### Command```bash
 npm install @coinbase/onchainkit
```#### Command```bash
 yarn add @coinbase/onchainkit
```#### Command```bash
 pnpm add @coinbase/onchainkit
```#### Command```bash
 bun add @coinbase/onchainkit
```</CodeGroup>
 
### Step: Get A Client API Key
Get your [Client API Key](https://portal.cdp.coinbase.com/projects/api-keys/client-key) from Coinbase Developer Platform.

Create a`.env`file in your project's root directory.

Add your Client API Key to the`.env`file:

#### Env file```dotenv

VITE_PUBLIC_ONCHAINKIT_API_KEY=YOUR_CLIENT_API_KEY

````### Step: Add Providers
Create a`providers.tsx`file. Add`OnchainKitProvider`with your desired config.

 Under the hood, OnchainKit will create our recommended Wagmi and QueryClient
 providers. If you wish to customize these providers, check out [Custom
 Supplemental Providers](/onchainkit/config/supplemental-providers).
#### Code```tsx
// @noErrors: 2307 2580 2339 - cannot find 'process', cannot find './wagmi', cannot find 'import.meta'
'use client';

import type { ReactNode } from 'react';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { base } from 'wagmi/chains'; // add baseSepolia for testing // [!code ++]

export function Providers(props: { children: ReactNode }) {
 return (
<OnchainKitProvider
 apiKey={import.meta.env.VITE_PUBLIC_ONCHAINKIT_API_KEY} // [!code ++]
 chain={base} // add baseSepolia for testing // [!code ++]
>
 {props.children}
</OnchainKitProvider>
 );
}
```### Step: Wrap your app with <AppProviders />
After configuring the providers in step 4, wrap your app with
 the`<AppProviders />`component.
#### Code```tsx
import { AppProviders } from 'src/AppProviders';

export default function App {
 return (
<AppProviders>
 <YourApp />
</AppProviders>
 );
}
```### Step: Import OnchainKit Styles
OnchainKit components come with pre-configured styles.
 To include these styles in your project, add the following import
 statement at the top of the file where imported`<AppProviders />`:
#### Code
```tsx
import { AppProviders } from 'src/AppProviders';
import '@coinbase/onchainkit/styles.css'; // [!code ++]

export default function App {
 return (
<AppProviders>
 <YourApp />
</AppProviders>
 );
}
````

This ensures that the OnchainKit styles are loaded and applied to your entire application.

- For Tailwind CSS users, check out our [Tailwind Integration Guide](/onchainkit/guides/tailwind).

- Update the appearance of components by using our built-in themes or crafting your own custom theme.
  Explore the possibilities in our [Theming Guide](/onchainkit/guides/themes).

## Start building!

Explore our ready-to-use onchain components:

- [**`Identity`**](/onchainkit/identity/identity) – Show [Basenames](/onchainkit/identity/identity), [avatars](/onchainkit/identity/avatar), [badges](/onchainkit/identity/badge), and [addresses](/onchainkit/identity/address).
- [**`Wallet`**](/onchainkit/wallet/wallet) – Create or connect wallets with [Connect Wallet](/onchainkit/wallet/wallet).
- [**`Transaction`**](/onchainkit/transaction/transaction) – Handle [transactions](/onchainkit/transaction/transaction) using EOAs or Smart Wallets.
- [**`Checkout`**](/onchainkit/checkout/checkout) – Integrate USDC [checkout](/onchainkit/checkout/checkout) flows with ease.
- [**`Fund`**](/onchainkit/fund/fund-button) – Create a [funding](/onchainkit/fund/fund-button) flow to onboard users.
- [**`Tokens`**](/onchainkit/token/token-chip) – Search and display [tokens](/onchainkit/token/token-chip) with various components.
- [**`Swap`**](/onchainkit/swap/swap) – Enable [token swaps](/onchainkit/swap/swap) in your app.
- [**`Mint`**](/onchainkit/mint/nft-mint-card) – [View](/onchainkit/mint/nft-mint-card) and [Mint](/onchainkit/mint/nft-mint-card) NFTs in your app.

# Remix Installation · OnchainKit

> Install OnchainKit using Remix

Install and configure OnchainKit with Remix.
If you are integrating OnchainKit into an existing project,
skip to the [OnchainKit installation](#install-onchainkit).

### Step: Install Remix

Create a new Remix project by using the Remix CLI.
More information about Remix can be found [Quickstart](https://remix.run/docs/en/main/start/quickstart)

#### Command

````bash
npx create-remix@latest
```### Step: Install OnchainKit
Add OnchainKit to your project by installing the`@coinbase/onchainkit`package.

 <CodeGroup>
#### Command```bash
 npm install @coinbase/onchainkit
```#### Command```bash
 yarn add @coinbase/onchainkit
```#### Command```bash
 pnpm add @coinbase/onchainkit
```#### Command```bash
 bun add @coinbase/onchainkit
```</CodeGroup>

### Step: Get A Client API Key
Get your [Client API Key](https://portal.cdp.coinbase.com/projects/api-keys/client-key) from Coinbase Developer Platform.


 Create a`.env`file in your project's root directory.


 Add your Client API Key to the`.env`file:
#### Env file```dotenv
PUBLIC_ONCHAINKIT_API_KEY=YOUR_CLIENT_API_KEY
```Update the`app/root.tsx`file to provide access to your Client API Key
 through`window.ENV`:
#### Code
```tsx
declare global {
 interface Window {
ENV: {
 PUBLIC_ONCHAINKIT_API_KEY: string; // [!code ++]
};
 }
}

export async function loader {
 return json({
ENV: {
 PUBLIC_ONCHAINKIT_API_KEY: process.env.PUBLIC_ONCHAINKIT_API_KEY, // [!code ++]
},
 });
}
```If this is the first env variable you've added to your project, you will need to
 update the`Layout`component of`app/root.tsx`to make it available to your app:
#### Code```tsx
export function Layout({ children }: { children: React.ReactNode }) {
 const data = useLoaderData<typeof loader>; // [!code ++]
 return (
<html lang="en">
 <head>
<meta charSet="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<Meta />
<Links />
 </head>
 <body>
{children}
<ScrollRestoration />
<script // [!code ++]
 dangerouslySetInnerHTML={{ // [!code ++]
 __html: `window.ENV = ${JSON.stringify( // [!code ++]
 data.ENV // [!code ++]
 )}`, // [!code ++]
 }} // [!code ++]
/>
<Scripts />
 </body>
</html>
 );
}
```### Step: Add Providers
Create a`providers.tsx`file. Add`OnchainKitProvider`with your desired config.

 Under the hood, OnchainKit will create our recommended Wagmi and QueryClient
 providers. If you wish to customize these providers, check out [Custom
 Supplemental Providers](/onchainkit/config/supplemental-providers).
#### Code```tsx
// @noErrors: 2307 2580 2339 - cannot find 'process', cannot find './wagmi', cannot find 'import.meta'
'use client';

import type { ReactNode } from 'react';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { base } from 'wagmi/chains'; // add baseSepolia for testing // [!code ++]

export function Providers(props: { children: ReactNode }) {
 const apiKey =
typeof window !== 'undefined'
 ? window.ENV?.PUBLIC_ONCHAINKIT_API_KEY
 : undefined;
 return (
<OnchainKitProvider
 apiKey={apiKey} // [!code ++]
 chain={base} // add baseSepolia for testing // [!code ++]
>
 {props.children}
</OnchainKitProvider>
 );
}
```### Step: Wrap your app with <AppProviders />
After configuring the providers in step 4, wrap your app with
 the`<AppProviders />`component.
#### Code```tsx
import { AppProviders } from 'src/AppProviders';

export default function App {
 return (
<AppProviders>
 <Outlet />
</AppProviders>
 );
}
```### Step: Import OnchainKit Styles
OnchainKit components come with pre-configured styles.
 To include these styles in your project, add the following import
 statement at the top of the file where imported`<AppProviders />`:
#### Code
```tsx
import { AppProviders } from 'src/AppProviders';
import '@coinbase/onchainkit/styles.css'; // [!code ++]

export default function App {
 return (
<AppProviders>
 <Outlet />
</AppProviders>
 );
}
````

This ensures that the OnchainKit styles are loaded and applied to your entire application.

- For Tailwind CSS users, check out our [Tailwind Integration Guide](/onchainkit/guides/tailwind).

- Update the appearance of components by using our built-in themes or crafting your own custom theme.
  Explore the possibilities in our [Theming Guide](/onchainkit/guides/themes).

## Start building!

Explore our ready-to-use onchain components:

- [**`Identity`**](/onchainkit/identity/identity) – Show [Basenames](/onchainkit/identity/identity), [avatars](/onchainkit/identity/avatar), [badges](/onchainkit/identity/badge), and [addresses](/onchainkit/identity/address).
- [**`Wallet`**](/onchainkit/wallet/wallet) – Create or connect wallets with [Connect Wallet](/onchainkit/wallet/wallet).
- [**`Transaction`**](/onchainkit/transaction/transaction) – Handle [transactions](/onchainkit/transaction/transaction) using EOAs or Smart Wallets.
- [**`Checkout`**](/onchainkit/checkout/checkout) – Integrate USDC [checkout](/onchainkit/checkout/checkout) flows with ease.
- [**`Fund`**](/onchainkit/fund/fund-button) – Create a [funding](/onchainkit/fund/fund-button) flow to onboard users.
- [**`Tokens`**](/onchainkit/token/token-chip) – Search and display [tokens](/onchainkit/token/token-chip) with various components.
- [**`Swap`**](/onchainkit/swap/swap) – Enable [token swaps](/onchainkit/swap/swap) in your app.
- [**`Mint`**](/onchainkit/mint/nft-mint-card) – [View](/onchainkit/mint/nft-mint-card) and [Mint](/onchainkit/mint/nft-mint-card) NFTs in your app.

# Astro Installation · OnchainKit

> Install OnchainKit using Astro

Install and configure OnchainKit with Astro.
If you are integrating OnchainKit into an existing project,
skip to the [OnchainKit installation](#install-onchainkit).

### Step: Install Astro

Create a new Astro project by using the Astro CLI.
More information about Astro can be found [Install And Setup](https://docs.astro.build/en/install-and-setup/#start-a-new-project)

 <CodeGroup>
#### Command
```bash
 npm create astro@latest
```#### Command```bash
 yarn create astro
```#### Command```bash
 pnpm create astro@latest
```</CodeGroup>
 
### Step: Install React
Astro does not come with React by default, so if you are not already using React
 in your application, you will need to install it.
#### Command```bash
npx astro add react
```### Step: Install OnchainKit
Add OnchainKit to your project by installing the`@coinbase/onchainkit`package.

 <CodeGroup>
#### Command```bash
 npm install @coinbase/onchainkit
```#### Command```bash
 yarn add @coinbase/onchainkit
```#### Command```bash
 pnpm add @coinbase/onchainkit
```#### Command```bash
 bun add @coinbase/onchainkit
```</CodeGroup>
 
### Step: Get A Client API Key
Get your [Client API Key](https://portal.cdp.coinbase.com/projects/api-keys/client-key) from Coinbase Developer Platform.

Create a`.env`file in your project's root directory.

Add your Client API Key to the`.env`file:

#### Env file```dotenv

PUBLIC_ONCHAINKIT_API_KEY=YOUR_CLIENT_API_KEY

````### Step: Add Providers
Create a`providers.tsx`file. Add`OnchainKitProvider`with your desired config.

 Under the hood, OnchainKit will create our recommended Wagmi and QueryClient
 providers. If you wish to customize these providers, check out [Custom
 Supplemental Providers](/onchainkit/config/supplemental-providers).
#### Code```tsx
// @noErrors: 2307 2580 2339 - cannot find 'process', cannot find './wagmi', cannot find 'import.meta'
'use client';

import type { ReactNode } from 'react';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { base } from 'wagmi/chains'; // add baseSepolia for testing // [!code ++]

export function Providers(props: { children: ReactNode }) {
 return (
<OnchainKitProvider
 apiKey={import.meta.env.PUBLIC_ONCHAINKIT_API_KEY} // [!code ++]
 chain={base} // add baseSepolia for testing // [!code ++]
>
 {props.children}
</OnchainKitProvider>
 );
}
```### Step: Wrap your OnchainKit components with <AppProviders />
After configuring the providers in step 4, you will need to wrap your OnchainKit components
 with the`<AppProviders />`component.

 There are two options for this:

 1. Create a component, eg.`<ReactIsland />`that contains all OnchainKit components.
 2. Wrap every OnchainKit component individually.

 <CodeGroup>
#### Code```tsx
 import { AppProviders } from '../AppProviders';

 export default function ReactIsland {
return (
 <AppProviders>
<YourReactAppContainingOnchainKitComponents />
 </AppProviders>
);
 }
```#### Code```tsx
 import { AppProviders } from '../AppProviders';
 import { OnchainKitComponent } from '@coinbase/onchainkit';

 export default function OnchainKitComponentWrapper {
return (
 <AppProviders>
<OnchainKitComponent />
 </AppProviders>
);
 }
```</CodeGroup>

 The advantage of ReactIsland is that you will only have a single provider at any time.
 The drawback is that your OnchainKit components will all need to live in the same Island.

 The advantage of individual wrappers is that you can use OnchainKit components anywhere in your app.
 The drawback is that you will have multiple providers if you use more than one OnchainKit component.

### Step: Add OnchainKit Components to your App
You can add OnchainKit components to your app by using the component(s) you
 created above into your`.astro`files.

 For example, if you created a ReactIsland, you can add it to your`src/pages/index.astro`file:
#### Code```astro
---
import Layout from '../layouts/Layout.astro';
import ReactIsland from '../components/ReactIsland';
---

<Layout title="Welcome to Astro.">
 <main>
...
<ReactIsland client:only="react" />
...
 </main>
</Layout>
```Don't forget to add the`client:only="react"`directive to your OnchainKit component,
 as this is required for Astro to render React components.

### Step: Import OnchainKit Styles
OnchainKit components come with pre-configured styles.
 To include these styles in your project, add the following import
 statement at the top of the`Layout.astro`file:
#### Code```tsx
import '@coinbase/onchainkit/styles.css';
````

This ensures that the OnchainKit styles are loaded and applied to your entire application.

- For Tailwind CSS users, check out our [Tailwind Integration Guide](/onchainkit/guides/tailwind).

- Update the appearance of components by using our built-in themes or crafting your own custom theme.
  Explore the possibilities in our [Theming Guide](/onchainkit/guides/themes).

## Start building!

Explore our ready-to-use onchain components:

- [**`Identity`**](/onchainkit/identity/identity) – Show [Basenames](/onchainkit/identity/identity), [avatars](/onchainkit/identity/avatar), [badges](/onchainkit/identity/badge), and [addresses](/onchainkit/identity/address).
- [**`Wallet`**](/onchainkit/wallet/wallet) – Create or connect wallets with [Connect Wallet](/onchainkit/wallet/wallet).
- [**`Transaction`**](/onchainkit/transaction/transaction) – Handle [transactions](/onchainkit/transaction/transaction) using EOAs or Smart Wallets.
- [**`Checkout`**](/onchainkit/checkout/checkout) – Integrate USDC [checkout](/onchainkit/checkout/checkout) flows with ease.
- [**`Fund`**](/onchainkit/fund/fund-button) – Create a [funding](/onchainkit/fund/fund-button) flow to onboard users.
- [**`Tokens`**](/onchainkit/token/token-chip) – Search and display [tokens](/onchainkit/token/token-chip) with various components.
- [**`Swap`**](/onchainkit/swap/swap) – Enable [token swaps](/onchainkit/swap/swap) in your app.
- [**`Mint`**](/onchainkit/mint/nft-mint-card) – [View](/onchainkit/mint/nft-mint-card) and [Mint](/onchainkit/mint/nft-mint-card) NFTs in your app.

# <OnchainKitProvider />

Provides the OnchainKit React Context to the app.

## Usage

#### Code

```tsx
// @noErrors: 2304 - Cannot find name 'MyComponent'
import { base } from 'viem/chains';
import { OnchainKitProvider } from '@coinbase/onchainkit';

const App = => {
 return (
<OnchainKitProvider
 config={{
appearance: {
 name: 'OnchainKit Playground',
 // logo omitted
 mode: 'auto',
 theme: 'default',
},
 }}
 chain={base}
>
 <MyComponent />
</OnchainKitProvider>
 );
};
```

## Props

[`OnchainKitProviderReact`](/onchainkit/config/types#onchainkitproviderreact)

| Prop                       | Description                                                                                                                                                                                | Required |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- |
| [`chain`](#chain)          | The chain that your OnchainKit project supports.                                                                                                                                           | Yes      |
| [`apiKey`](#apikey)        | Client API Key from Coinbase Developer Platform.                                                                                                                                           | No       |
| [`rpcUrl`](#rpc-url)       | RPC URL for onchain requests.                                                                                                                                                              | No       |
| [`projectId`](#project-id) | Your Coinbase Developer Platform Project ID.                                                                                                                                               | No       |
| [`config`](#config)        | - `config.appearance`— Customize your OnchainKit project's appearance <br /> -`config.paymaster`— Paymaster URL for gas sponsorship <br /> -`config.wallet` — Wallet configuration options | No       |
| [`schemaId`](#schema-id)   | _\[Deprecation Pending]_ The schema ID for attestations from the Ethereum Attestation Service (EAS).                                                                                       | No       |
| [`address`](#address)      | _\[Deprecation Pending]_ This prop is no longer used.                                                                                                                                      | No       |

### Chain

`chain`specifies the chain on which your OnchainKit project will operate.

This prop is required for all OnchainKit components.

We recommend importing chain data from [viem](https://viem.sh/docs/chains/introduction)

###`apiKey``apiKey` is your Coinbase Developer Platform Client API Key.

This prop is required for most OnchainKit components, including:

- [`<Checkout>`](/onchainkit/checkout/checkout)
- [`<NFTCard>`](/onchainkit/mint/nft-card)
- [`<NFTMintCard>`](/onchainkit/mint/nft-mint-card)
- [`<Swap>`](/onchainkit/swap/swap)
- [`<Transaction>`](/onchainkit/transaction/transaction)

You can get a [Client API Key](https://portal.cdp.coinbase.com/projects/project-id/api-keys/client-key)
from Coinbase Developer Platform.

### RPC URL

`rpcUrl`is required for any onchain requests. If you provide your own RPC URL,
OnchainKit will use it.

If you do not provide your own RPC URL, you must provide an`apiKey`, which
enables OnchainKit to use the
[Coinbase Developer Platform Node](https://portal.cdp.coinbase.com/products/node)

### Project ID

`projectId`is your Coinbase Developer Platform Project ID.

This prop is required for the`<FundButton />`component.

You can obtain a Project ID from the [Coinbase Developer Platform](https://portal.cdp.coinbase.com/projects)

### Config`config`is an object that can be used to customize the appearance and behavior

of the OnchainKit components.

This prop has three keys:`appearance`, `paymaster`, and `wallet`.

#### Appearance

`appearance`manages the appearance of the OnchainKit components and has the following properties:

_`name`— The name of your OnchainKit project
_`logo`— The URL of the logo for your OnchainKit project \*`mode`— The mode of the OnchainKit components. Can be`auto`, `dark`, or `light`.

- `theme`— The theme of the OnchainKit components. Can be`base`, `cyberpunk`, `default`, `hacker`, or a custom theme.

Explore appearance options in the [OnchainKit Playground](https://onchainkit.xyz/playground)

#### Paymaster

`paymaster`represents the Paymaster URL that enables you to sponsor gas for your users.

You can configure your Paymaster and obtain your Paymaster URL from the
[Coinbase Developer Platform](https://portal.cdp.coinbase.com/products/bundler-and-paymaster)

#### Wallet`wallet`configures the wallet connection experience and has the following properties:

_`display`— The display mode for the wallet interface. Can be either:
_`'modal'`— Shows wallet connection in a modal overlay with wallet aggregation
_`'classic'`— Shows wallet connection in the traditional inline style
_`termsUrl`— URL to your terms of service \*`privacyUrl`— URL to your privacy policy

### Address _\[Deprecation Pending]_`address`is no longer used and will be removed in a future version of

OnchainKit.

### Schema ID _\[Deprecation Pending]_`schemaId`is no longer used as OnchainKit now defaults to using Coinbase

attestations for the`<Badge />`component.

This prop will be removed in a future version of OnchainKit.

# Supplemental Providers · OnchainKit

> Customize the Wagmi and QueryClient providers

Under the hood, OnchainKit will create our recommended Wagmi and QueryClient
providers. If you wish to customize the providers, you can do so by creating
these providers with your own configuration.

For example, the following code creates custom Wagmi and QueryClient providers:

<CodeGroup>
#### Code```tsx
 // @noErrors: 2554
 import { http, cookieStorage, createConfig, createStorage } from 'wagmi';
 import { base } from 'wagmi/chains'; // add baseSepolia for testing // [!code ++]
 import { coinbaseWallet } from 'wagmi/connectors';

export function getConfig {
return createConfig({
chains: [base], // add baseSepolia for testing // [!code ++]
connectors: [
coinbaseWallet({
appName: 'OnchainKit',
preference: 'smartWalletOnly',
version: '4',
}),
],
storage: createStorage({
storage: cookieStorage,
}),
ssr: true,
transports: {
[base.id]: http, // add baseSepolia for testing // [!code ++]
},
});
}

declare module 'wagmi' {
interface Register {
config: ReturnType<typeof getConfig>;
}
}
`#### Code`tsx
// @noErrors: 2307 2580 2339 2554 - cannot find 'process', cannot find './wagmi', cannot find 'import.meta'
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { base } from 'wagmi/chains'; // add baseSepolia for testing // [!code ++]
import { type ReactNode, useState } from 'react';
import { type State, WagmiProvider } from 'wagmi';

import { getConfig } from '@/wagmi'; // your import path may vary // [!code ++]

export function Providers(props: {
children: ReactNode;
initialState?: State;
}) {
const [config] = useState( => getConfig);
const [queryClient] = useState( => new QueryClient);
const apiKey = // [!code ++]
typeof window !== 'undefined' // [!code ++]
? window.ENV?.PUBLIC_ONCHAINKIT_API_KEY // [!code ++]
: undefined; // [!code ++]

return (
<WagmiProvider config={config} initialState={props.initialState}>
<QueryClientProvider client={queryClient}>
<OnchainKitProvider
apiKey={apiKey} // [!code ++]
chain={base} // add baseSepolia for testing // [!code ++]

> {props.children}
> </OnchainKitProvider>
> </QueryClientProvider>
> </WagmiProvider>
> );
> }

````
</CodeGroup>

## Start building!

Explore our ready-to-use onchain components:

* [**`Identity`**](/onchainkit/identity/identity) – Show [Basenames](/onchainkit/identity/identity), [avatars](/onchainkit/identity/avatar), [badges](/onchainkit/identity/badge), and [addresses](/onchainkit/identity/address).
* [**`Wallet`**](/onchainkit/wallet/wallet) – Create or connect wallets with [Connect Wallet](/onchainkit/wallet/wallet).
* [**`Transaction`**](/onchainkit/transaction/transaction) – Handle [transactions](/onchainkit/transaction/transaction) using EOAs or Smart Wallets.
* [**`Checkout`**](/onchainkit/checkout/checkout) – Integrate USDC [checkout](/onchainkit/checkout/checkout) flows with ease.
* [**`Fund`**](/onchainkit/fund/fund-button) – Create a [funding](/onchainkit/fund/fund-button) flow to onboard users.
* [**`Tokens`**](/onchainkit/token/token-chip) – Search and display [tokens](/onchainkit/token/token-chip) with various components.
* [**`Swap`**](/onchainkit/swap/swap) – Enable [token swaps](/onchainkit/swap/swap) in your app.
* [**`Mint`**](/onchainkit/mint/nft-mint-card) – [View](/onchainkit/mint/nft-mint-card) and [Mint](/onchainkit/mint/nft-mint-card) NFTs in your app.

# Lifecycle Status · OnchainKit

> How to influence the behavior of your components and onchain data with Lifecycle Status.

OnchainKit Lifecycle Status allows you to manage the state of APIs and onchain transactions seamlessly within components.

## How to listen to the Lifecycle Status

The Lifecycle Status is a TypeScript object that provides easy access to the `statusName`and`statusData`properties,
allowing you to stay informed and responsive.
#### Code```tsx
import { useCallback } from 'react';
import { Transaction } from '@coinbase/onchainkit/transaction';
// ---cut-before---
import type { LifecycleStatus } from '@coinbase/onchainkit/transaction';

const handleOnStatus = useCallback((status: LifecycleStatus) => {
 console.log('LifecycleStatus', status);
}, []);

<Transaction onStatus={handleOnStatus}>
 // omitted component code for brevity
</Transaction>
```## Lifecycle Status

The Lifecycle Status includes 3 states common to all components:

###`init`The component is initialized and ready for use.
#### Code```ts
{
 statusName: 'init';
 statusData: null;
}
```###`success`The component has successfully completed its main action, such as`swap`or`transaction`.
#### Code
```ts
{
 statusName: 'success';
 statusData: {
// the data returned from the API or onchain operation
 };
}
```###`error`The component has encountered an issue while fetching API data, executing an onchain operation,
or needs to display a visual message to the user.
#### Code```ts
{
 statusName: 'error';
 statusData: {
code: string; // The error code representing the location of the error
error: string; // The error message providing developer details
message: string; // The error message providing user-facing details
 };
}
````

Each component brings its own unique experience, and we have explored both the swap and transaction processes.

## Lifecycle Status with [`<Swap />`](/onchainkit/swap/swap)

### `amountChange`Any of the Swap Input fields have been updated.

#### Code```ts

{
statusName: 'amountChange';
statusData: {
amountFrom: string;
amountTo: string;
tokenFrom?: Token;
tokenTo?: Token;
isMissingRequiredField: boolean;
};
}
```###`transactionPending`The transaction has been submitted to the network but has not yet been confirmed to be included in a block.
During this pending state, the transaction is waiting to be validated by the network's consensus mechanism.

#### Code```ts

{
statusName: 'transactionPending';
statusData: null;
}
```###`transactionApproved`The transaction has been verified to be valid and it has been included in a block
however the transaction is not yet finalized.

#### Code```ts

{
statusName: 'transactionApproved';
statusData: {
transactionHash: Hex;
transactionType: 'Batched' | 'ERC20' | 'Permit2' | 'Swap';
};
}
```###`success`The transaction has been added to the blockchain and the transaction is considered final.

#### Code```ts

{
statusName: 'success';
statusData: {
transactionReceipt: TransactionReceipt;
};
}

````
## Lifecycle Status with [`<Transaction />`](/onchainkit/transaction/transaction)

### `transactionIdle`The transaction component is waiting for the user to take action.
#### Code```ts
{
 statusName: 'transactionIdle';
 statusData: null;
}
```###`transactionPending`The transaction has been submitted to the network but has not yet been confirmed to be included in a block.
During this pending state, the transaction is waiting to be validated by the network's consensus mechanism.
#### Code```ts
{
 statusName: 'transactionPending';
 statusData: null;
}
```###`success`The transaction has been added to the blockchain and the transaction is considered final.
#### Code```ts
{
 statusName: 'success';
 statusData: {
transactionReceipts: TransactionReceipt[];
 };
}
```# OnchainKit Themes · OnchainKit

> Customize the appearance of OnchainKit's components


## Overview

OnchainKit provides flexible appearance control through two main features:`mode`and`theme`.

* **Mode**: Controls the light/dark appearance and includes an auto option that inherits the system preference.
* **Theme**: Governs the overall styling across components.

You can choose from built-in themes or dynamically switch modes based on user preference or system settings, allowing for a customized and responsive user interface.

## Built-in Themes

OnchainKit offers multiple themes to quickly style your components. Set the theme via the `OnchainKitProvider`using`config.appearance.theme`:

* `default`: Includes both light and dark modes.
* `base`: Single mode only.
* `cyberpunk`: Single mode only.
* `hacker`: Single mode only.
* `custom`: Single mode only.

If no theme is selected, the **`default`** theme is applied automatically.
#### Code
```tsx
// @noErrors: 2304 17008 1005
<OnchainKitProvider
 apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
 chain={base}
 config={{ // [!code focus]
appearance: { // [!code focus]
 mode: 'auto', // 'auto' | 'light' | 'dark'
 theme: 'default', // 'default' | 'base' | 'cyberpunk' | 'hacker' // [!code focus]
}, // [!code focus]
 }} // [!code focus]
>
```## Mode

Control the color scheme by setting the`config.appearance.mode`property of the`OnchainKitProvider`:

* `auto`: Automatically switches between light and dark mode based on the user’s OS preference.
* `light`: Forces all components to use the light version of the theme.
* `dark`: Forces all components to use the dark version of the theme.

If no mode is specified, `auto`mode will be applied by default.
#### Code```tsx
// @noErrors: 2304 17008 1005
<OnchainKitProvider
 apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
 chain={base}
 config={{
appearance: {
 mode: 'auto', // 'auto' | 'light' | 'dark' // [!code focus]
 theme: 'default', // 'default' | 'base' | 'cyberpunk' | 'hacker' | 'your-custom-theme'
},
 }}
>
```## CSS Overrides

Fine-tune specific aspects of an existing theme.
This is useful when you want to make adjustments to the appearance of the components without creating an entirely new theme.```css
@layer base {
 :root
 .default-light,
 .default-dark,
 .base,
 .cyberpunk,
 .hacker {
/* Override specific variables as needed */
--ock-font-family: 'your-custom-value';
--ock-border-radius: 'your-custom-value';
--ock-text-primary: 'your-custom-value';
 }
}
```## Custom Theme

Define an entirely new look and feel for your application.
This gives you complete control over all aspects of the design, including colors, fonts, and other visual properties.

#### Usage Options:

##### Automatic Light/Dark Mode Switching:

* To automatically switch between light and dark versions of your custom theme:
#### Code```tsx
// @noErrors: 2304 17008 1005
<OnchainKitProvider
 apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
 chain={base}
 config={{
appearance: {
 mode: 'auto', // [!code focus]
 theme: 'custom', // [!code focus]
},
 }}
>
```##### Single Theme Version:

* To use only one version of your custom theme at all times:
#### Code```tsx
// @noErrors: 2304 17008 1005
<OnchainKitProvider
 apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
 chain={base}
 config={{
appearance: {
 mode: 'light', // [!code focus]
 theme: 'custom', // [!code focus]
},
 }}
>
```##### Defining a custom theme

Use CSS variables to define your custom theme.
The class name definitions must include the`-light`or`-dark`suffix.```css

.custom-light {
 /* Font and Shape */
 --ock-font-family: 'your-custom-value';
 --ock-border-radius: 'your-custom-value';
 --ock-border-radius-inner: 'your-custom-value';

 /* Text Colors */
 --ock-text-inverse: 'your-custom-value';
 --ock-text-foreground: 'your-custom-value';
 --ock-text-foreground-muted: 'your-custom-value';
 --ock-text-error: 'your-custom-value';
 --ock-text-primary: 'your-custom-value';
 --ock-text-success: 'your-custom-value';
 --ock-text-warning: 'your-custom-value';
 --ock-text-disabled: 'your-custom-value';

 /* Background Colors */
 --ock-bg-default: 'your-custom-value';
 --ock-bg-default-hover: 'your-custom-value';
 --ock-bg-default-active: 'your-custom-value';
 --ock-bg-alternate: 'your-custom-value';
 --ock-bg-alternate-hover: 'your-custom-value';
 --ock-bg-alternate-active: 'your-custom-value';
 --ock-bg-inverse: 'your-custom-value';
 --ock-bg-inverse-hover: 'your-custom-value';
 --ock-bg-inverse-active: 'your-custom-value';
 --ock-bg-primary: 'your-custom-value';
 --ock-bg-primary-hover: 'your-custom-value';
 --ock-bg-primary-active: 'your-custom-value';
 --ock-bg-primary-washed: 'your-custom-value';
 --ock-bg-primary-disabled: 'your-custom-value';
 --ock-bg-secondary: 'your-custom-value';
 --ock-bg-secondary-hover: 'your-custom-value';
 --ock-bg-secondary-active: 'your-custom-value';
 --ock-bg-error: 'your-custom-value';
 --ock-bg-warning: 'your-custom-value';
 --ock-bg-success: 'your-custom-value';
 --ock-bg-default-reverse: 'your-custom-value';

 /* Icon Colors */
 --ock-icon-color-primary: 'your-custom-value';
 --ock-icon-color-foreground: 'your-custom-value';
 --ock-icon-color-foreground-muted: 'your-custom-value';
 --ock-icon-color-inverse: 'your-custom-value';
 --ock-icon-color-error: 'your-custom-value';
 --ock-icon-color-success: 'your-custom-value';
 --ock-icon-color-warning: 'your-custom-value';

 /* Border Colors */
 --ock-border-line-primary: 'your-custom-value';
 --ock-border-line-default: 'your-custom-value';
 --ock-border-line-heavy: 'your-custom-value';
 --ock-border-line-inverse: 'your-custom-value';
}

.custom-dark {
 /* Define dark mode custom classes here */
}
```# Use Basename · OnchainKit

> Integrate Basenames into your onchain app, in just a few steps.

Basenames are an essential onchain building block that empowers builders to establish their identity on Base by registering human-readable names for their wallet addresses.

They operate entirely onchain, utilizing the same technology as ENS names, and are deployed on Base.

You can integrate [Basenames](https://www.base.org/names) into your app with these few steps.


### Step: New to OnchainKit?
Follow the [Getting Started](/onchainkit/getting-started) guide to install the package.

### Step: Already using OnchainKit?
Update to the latest version and choose from the following steps: a React component approach, a React hook, or a pure TypeScript utility function.

## React components with`<Avatar>`and`<Name>`

Use the [`<Avatar>`](/onchainkit/identity/avatar) and [`<Name>`](/onchainkit/identity/name) components to display Basenames associated with Ethereum addresses.

The `chain`prop is optional and setting to Base, it's what makes the components switch from ENS to Basenames.
#### Code```tsx
// @noErrors: 2657 - JSX expressions must have one parent element
import { Avatar, Name } from '@coinbase/onchainkit/identity';
import { base } from 'viem/chains';

const address = '0x02feeb0AdE57b6adEEdE5A4EEea6Cf8c21BeB6B1';

// omitted component code for brevity
<Avatar address={address} chain={base} />
<Name address={address} chain={base} />
```Video: https://docs.base.org/onchainkit/guides/use-basename-in-onchain-app


## React hooks with`useAvatar`and`useName`

Use the [`useAvatar`](/onchainkit/identity/use-avatar) and [`useName`](/onchainkit/identity/use-name) hooks to get Basenames associated with Ethereum addresses.

The hooks are incredibly useful for building custom components while leveraging OnchainKit for efficient data fetching.

<CodeGroup>
#### Code
```tsx
 import { useAvatar, useName } from '@coinbase/onchainkit/identity';
 import { base } from 'viem/chains';

 const address = '0x02feeb0AdE57b6adEEdE5A4EEea6Cf8c21BeB6B1';
 const basename = 'zizzamia.base.eth';
 const { data: avatar, isLoading: avatarIsLoading } = await useAvatar({ ensName: basename, chain: base });
 const { data: name, isLoading: nameIsLoading } = await useName({ address, chain: base });
```#### Code```ts
 { data: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwMCIgaGVpZ2h0PSIzMDAwIiB2aWV3Qm94PSIwIDAgMzAwMCAzMDAwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxnIGNsaXAtcGF0aD0idXJsKCNjbGlwMF81NTY5XzcyODM1KSI+PHJlY3Qgd2lkdGg9IjMwMDAiIGhlaWdodD0iMzAwMCIgZmlsbD0iIzE1NURGRCIvPjxjaXJjbGUgY3g9IjE1MDAiIGN5PSIxNTAwIiByPSIxNTAwIiBmaWxsPSIjMTU1REZEIi8+PHBhdGggZD0iTTI3MTMuMTMgMTUwMEMyNzMxLjIgMTY4MC45MiAyNjE1LjEzIDE4MTguMTUgMjUwNy43OCAxOTI0LjQyQzIzOTQuNyAyMDMyLjEzIDIyOTAuNDQgMjEwOC44OCAyMjAwLjg4IDIyMDAuNjFDMjEwOS4xNSAyMjkwLjE2IDIwMzIuMjIgMjM5NC42MSAxOTI0LjUxIDI1MDcuNjhDMTgxOC4xNSAyNjE1LjA0IDE2ODAuOTIgMjczMS4xMSAxNTAwIDI3MTMuMTNDMTMxOS4wOCAyNzMxLjIgMTE4MS44NSAyNjE1LjEzIDEwNzUuNTggMjUwNy43OEM5NjcuODY2IDIzOTQuNyA4OTEuMTIgMjI5MC40NCA3OTkuMzg5IDIyMDAuODhDNzA5LjgzNyAyMTA5LjE1IDYwNS4zOSAyMDMyLjIyIDQ5Mi4zMTUgMTkyNC41MUMzODQuOTYyIDE4MTguMTUgMjY4Ljg5IDE2ODAuOTIgMjg2Ljg3MyAxNTAwQzI2OC43OTkgMTMxOS4wOCAzODQuODcxIDExODEuODUgNDkyLjIyNCAxMDc1LjU4QzYwNS4yOTkgOTY3Ljg2NiA3MDkuNTY0IDg5MS4xMiA3OTkuMTE2IDc5OS4zODlDODkwLjg0OCA3MDkuODM3IDk2Ny43NzUgNjA1LjM5IDEwNzUuNDkgNDkyLjMxNUMxMTgxLjg1IDM4NC44NzEgMTMxOS4wOCAyNjguNzk5IDE1MDAgMjg2Ljg3M0MxNjgwLjkyIDI2OC43OTkgMTgxOC4xNSAzODQuODcxIDE5MjQuNDIgNDkyLjIyNEMyMDMyLjEzIDYwNS4yOTkgMjEwOC44OCA3MDkuNTY0IDIyMDAuNjEgNzk5LjExNkMyMjkwLjE2IDg5MC44NDggMjM5NC42MSA5NjcuNzc1IDI1MDcuNjggMTA3NS40OUMyNjE1LjA0IDExODEuODUgMjczMS4xMSAxMzE5LjA4IDI3MTMuMTMgMTUwMFoiIGZpbGw9IndoaXRlIi8+PHBhdGggZD0iTTEzOTEuMDYgMTUwMEMxMzkxLjA2IDE2NDcuODkgMTM1OC40IDE3ODEuNjIgMTMwNS43NCAxODc4LjI4QzEyNTMuMDMgMTk3NS4wNSAxMTgwLjY5IDIwMzQgMTEwMS41MyAyMDM0QzEwMjIuMzYgMjAzNCA5NTAuMDMxIDE5NzUuMDUgODk3LjMxNCAxODc4LjI4Qzg0NC42NiAxNzgxLjYyIDgxMiAxNjQ3Ljg5IDgxMiAxNTAwQzgxMiAxMzUyLjExIDg0NC42NiAxMjE4LjM4IDg5Ny4zMTQgMTEyMS43MkM5NTAuMDMxIDEwMjQuOTUgMTAyMi4zNiA5NjYgMTEwMS41MyA5NjZDMTE4MC42OSA5NjYgMTI1My4wMyAxMDI0Ljk1IDEzMDUuNzQgMTEyMS43MkMxMzU4LjQgMTIxOC4zOCAxMzkxLjA2IDEzNTIuMTEgMTM5MS4wNiAxNTAwWiIgZmlsbD0iIzE1NURGRCIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSI2Ii8+PGVsbGlwc2UgY3g9IjExMDIuNTciIGN5PSIxMTk0LjkzIiByeD0iMTI2LjQxNCIgcnk9IjIzMS45MzQiIGZpbGw9IndoaXRlIi8+PHBhdGggZD0iTTIxODcuMTYgMTUwMEMyMTg3LjE2IDE2NDcuODkgMjE1NC41IDE3ODEuNjIgMjEwMS44NCAxODc4LjI4QzIwNDkuMTIgMTk3NS4wNSAxOTc2Ljc5IDIwMzQgMTg5Ny42MyAyMDM0QzE4MTguNDYgMjAzNCAxNzQ2LjEzIDE5NzUuMDUgMTY5My40MSAxODc4LjI4QzE2NDAuNzYgMTc4MS42MiAxNjA4LjEgMTY0Ny44OSAxNjA4LjEgMTUwMEMxNjA4LjEgMTM1Mi4xMSAxNjQwLjc2IDEyMTguMzggMTY5My40MSAxMTIxLjcyQzE3NDYuMTMgMTAyNC45NSAxODE4LjQ2IDk2NiAxODk3LjYzIDk2NkMxOTc2Ljc5IDk2NiAyMDQ5LjEyIDEwMjQuOTUgMjEwMS44NCAxMTIxLjcyQzIxNTQuNSAxMjE4LjM4IDIxODcuMTYgMTM1Mi4xMSAyMTg3LjE2IDE1MDBaIiBmaWxsPSIjMTU1REZEIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjYiLz48ZWxsaXBzZSBjeD0iMTg5Ni41OCIgY3k9IjExOTQuOTMiIHJ4PSIxMjYuNDE0IiByeT0iMjMxLjkzNCIgZmlsbD0id2hpdGUiLz48L2c+PGRlZnM+PGNsaXBQYXRoIGlkPSJjbGlwMF81NTY5XzcyODM1Ij48cmVjdCB3aWR0aD0iMzAwMCIgaGVpZ2h0PSIzMDAwIiBmaWxsPSJ3aGl0ZSIvPjwvY2xpcFBhdGg+PC9kZWZzPjwvc3ZnPg==', isLoading: false }
 { data: 'zizzamia.base.eth', isLoading: false }
```</CodeGroup>

## Typescript utility with`getAvatar`and`getName`

Use the [`getAvatar`](/onchainkit/identity/get-avatar) and [`getName`](/onchainkit/identity/get-name) functions to get Basenames associated with Ethereum addresses.

Being pure functions, it seamlessly integrates into any TypeScript project, including Vue, Angular, Svelte, or Node.js.

<CodeGroup>
#### Code
```tsx
 import { getAvatar, getName } from '@coinbase/onchainkit/identity';
 import { base } from 'viem/chains';

 const address = '0x02feeb0AdE57b6adEEdE5A4EEea6Cf8c21BeB6B1';
 const basename = 'zizzamia.base.eth';
 const avatar = await getAvatar({ ensName: basename, chain: base });
 const name = await getName({ address, chain: base });
```#### Code```ts
 data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwMCIgaGVpZ2h0PSIzMDAwIiB2aWV3Qm94PSIwIDAgMzAwMCAzMDAwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxnIGNsaXAtcGF0aD0idXJsKCNjbGlwMF81NTY5XzcyODM1KSI+PHJlY3Qgd2lkdGg9IjMwMDAiIGhlaWdodD0iMzAwMCIgZmlsbD0iIzE1NURGRCIvPjxjaXJjbGUgY3g9IjE1MDAiIGN5PSIxNTAwIiByPSIxNTAwIiBmaWxsPSIjMTU1REZEIi8+PHBhdGggZD0iTTI3MTMuMTMgMTUwMEMyNzMxLjIgMTY4MC45MiAyNjE1LjEzIDE4MTguMTUgMjUwNy43OCAxOTI0LjQyQzIzOTQuNyAyMDMyLjEzIDIyOTAuNDQgMjEwOC44OCAyMjAwLjg4IDIyMDAuNjFDMjEwOS4xNSAyMjkwLjE2IDIwMzIuMjIgMjM5NC42MSAxOTI0LjUxIDI1MDcuNjhDMTgxOC4xNSAyNjE1LjA0IDE2ODAuOTIgMjczMS4xMSAxNTAwIDI3MTMuMTNDMTMxOS4wOCAyNzMxLjIgMTE4MS44NSAyNjE1LjEzIDEwNzUuNTggMjUwNy43OEM5NjcuODY2IDIzOTQuNyA4OTEuMTIgMjI5MC40NCA3OTkuMzg5IDIyMDAuODhDNzA5LjgzNyAyMTA5LjE1IDYwNS4zOSAyMDMyLjIyIDQ5Mi4zMTUgMTkyNC41MUMzODQuOTYyIDE4MTguMTUgMjY4Ljg5IDE2ODAuOTIgMjg2Ljg3MyAxNTAwQzI2OC43OTkgMTMxOS4wOCAzODQuODcxIDExODEuODUgNDkyLjIyNCAxMDc1LjU4QzYwNS4yOTkgOTY3Ljg2NiA3MDkuNTY0IDg5MS4xMiA3OTkuMTE2IDc5OS4zODlDODkwLjg0OCA3MDkuODM3IDk2Ny43NzUgNjA1LjM5IDEwNzUuNDkgNDkyLjMxNUMxMTgxLjg1IDM4NC44NzEgMTMxOS4wOCAyNjguNzk5IDE1MDAgMjg2Ljg3M0MxNjgwLjkyIDI2OC43OTkgMTgxOC4xNSAzODQuODcxIDE5MjQuNDIgNDkyLjIyNEMyMDMyLjEzIDYwNS4yOTkgMjEwOC44OCA3MDkuNTY0IDIyMDAuNjEgNzk5LjExNkMyMjkwLjE2IDg5MC44NDggMjM5NC42MSA5NjcuNzc1IDI1MDcuNjggMTA3NS40OUMyNjE1LjA0IDExODEuODUgMjczMS4xMSAxMzE5LjA4IDI3MTMuMTMgMTUwMFoiIGZpbGw9IndoaXRlIi8+PHBhdGggZD0iTTEzOTEuMDYgMTUwMEMxMzkxLjA2IDE2NDcuODkgMTM1OC40IDE3ODEuNjIgMTMwNS43NCAxODc4LjI4QzEyNTMuMDMgMTk3NS4wNSAxMTgwLjY5IDIwMzQgMTEwMS41MyAyMDM0QzEwMjIuMzYgMjAzNCA5NTAuMDMxIDE5NzUuMDUgODk3LjMxNCAxODc4LjI4Qzg0NC42NiAxNzgxLjYyIDgxMiAxNjQ3Ljg5IDgxMiAxNTAwQzgxMiAxMzUyLjExIDg0NC42NiAxMjE4LjM4IDg5Ny4zMTQgMTEyMS43MkM5NTAuMDMxIDEwMjQuOTUgMTAyMi4zNiA5NjYgMTEwMS41MyA5NjZDMTE4MC42OSA5NjYgMTI1My4wMyAxMDI0Ljk1IDEzMDUuNzQgMTEyMS43MkMxMzU4LjQgMTIxOC4zOCAxMzkxLjA2IDEzNTIuMTEgMTM5MS4wNiAxNTAwWiIgZmlsbD0iIzE1NURGRCIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSI2Ii8+PGVsbGlwc2UgY3g9IjExMDIuNTciIGN5PSIxMTk0LjkzIiByeD0iMTI2LjQxNCIgcnk9IjIzMS45MzQiIGZpbGw9IndoaXRlIi8+PHBhdGggZD0iTTIxODcuMTYgMTUwMEMyMTg3LjE2IDE2NDcuODkgMjE1NC41IDE3ODEuNjIgMjEwMS44NCAxODc4LjI4QzIwNDkuMTIgMTk3NS4wNSAxOTc2Ljc5IDIwMzQgMTg5Ny42MyAyMDM0QzE4MTguNDYgMjAzNCAxNzQ2LjEzIDE5NzUuMDUgMTY5My40MSAxODc4LjI4QzE2NDAuNzYgMTc4MS42MiAxNjA4LjEgMTY0Ny44OSAxNjA4LjEgMTUwMEMxNjA4LjEgMTM1Mi4xMSAxNjQwLjc2IDEyMTguMzggMTY5My40MSAxMTIxLjcyQzE3NDYuMTMgMTAyNC45NSAxODE4LjQ2IDk2NiAxODk3LjYzIDk2NkMxOTc2Ljc5IDk2NiAyMDQ5LjEyIDEwMjQuOTUgMjEwMS44NCAxMTIxLjcyQzIxNTQuNSAxMjE4LjM4IDIxODcuMTYgMTM1Mi4xMSAyMTg3LjE2IDE1MDBaIiBmaWxsPSIjMTU1REZEIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjYiLz48ZWxsaXBzZSBjeD0iMTg5Ni41OCIgY3k9IjExOTQuOTMiIHJ4PSIxMjYuNDE0IiByeT0iMjMxLjkzNCIgZmlsbD0id2hpdGUiLz48L2c+PGRlZnM+PGNsaXBQYXRoIGlkPSJjbGlwMF81NTY5XzcyODM1Ij48cmVjdCB3aWR0aD0iMzAwMCIgaGVpZ2h0PSIzMDAwIiBmaWxsPSJ3aGl0ZSIvPjwvY2xpcFBhdGg+PC9kZWZzPjwvc3ZnPg==
 zizzamia.base.eth;
```</CodeGroup>


# Use AI-powered IDEs · OnchainKit

> How to use AI-powered IDEs to generate code for OnchainKit.

You can also directly download the [context](https://github.com/fakepixels/md-generator/blob/master/combined-ock-docs-0.35.8.mdx) and import it into AI-powered IDE such as Cursor or Replit.

In addition, you can import a`.cursorrules`file in the root of your project via [Cursor Directory](https://cursor.directory/onchainkit Cursor also has an array of resources [Learn](https://cursor.directory/learn) on how to use AI-powered IDEs.


## AI Tooling

### Replit

[Replit](https://replit.com) is a cloud-based coding platform that streamlines the process of setting up, building, sharing, and deploying projects. It allows developers to code in a Google Docs-like environment, and pre-built templates provide a great starting point for building a website, app, or game. Its new AI Agent can assist with the code development process and work with several files at once, making the programming process feel like a one-on-one conversation.

### Cursor

[Cursor](https://cursor.com) is an AI-powered code editor that makes the programming experience feel like magic. Built as a fork of VS Code, it boasts powerful features like AI code completion, natural language editing, and codebase understanding. Cursor Pro is free for the first two weeks after signup, and offers more powerful models.

### Using OnchainKit with CDP SDK

You can use OnchainKit with [CDP SDK](https://docs.cdp.coinbase.com/get-started/docs/overview) to access additional capabilities such as [AgentKit](https://docs.cdp.coinbase.com/agentkit/docs/welcome)


# Developer's Guide to Effective AI Prompting

> Learn practical AI prompting techniques to enhance your coding workflow and get better results from AI coding assistants.

This guide helps developers leverage AI tools effectively in their coding workflow. Whether you're using Cursor, GitHub Copilot, or other AI assistants,
these strategies will help you get better results and integrate AI smoothly into your development process.

## Understanding Context Windows

### Why Context Matters

AI coding assistants have what's called a "context window" - the amount of text they can "see" and consider when generating responses. Think of it as the AI's working memory:

* Most modern AI assistants can process thousands of tokens (roughly 4-5 words per token)
* Everything you share and everything the AI responds with consumes this limited space
* Once the context window fills up, parts of your conversational history may be lost.

This is why providing relevant context upfront is crucial - the AI can only work with what it can "see" in its current context window.

### Optimizing for Context Windows

To get the most out of AI assistants:

1. **Prioritize relevant information**: Focus on sharing the most important details first.
2. **Remove unnecessary content**: Avoid pasting irrelevant code or documentation.
3. **Structure your requests**: Use clear sections and formatting to make information easy to process.
4. **Reference external resources**: For large codebases, consider sharing only the most relevant files.

For larger projects, create and reference a central documentation file that summarizes key information, rather than repeatedly explaining the same context.

## Setting Up AI Tools

### Configuring Cursor Rules

Cursor Rules allow you to provide consistent context to Cursor AI, making it more effective at understanding your codebase and providing relevant suggestions.

#### Creating Cursor Rules

1. Open the Command Palette in Cursor:
 * Mac:`Cmd + Shift + P`* Windows/Linux:`Ctrl + Shift + P`2. Search for "Cursor Rules" and select the option to create or edit rules

3. Add project-specific rules that help Cursor understand your project:

 * [Next.js](https://raw.githubusercontent.com/PatrickJS/awesome-cursorrules/refs/heads/main/rules/nextjs-tailwind-typescript-apps-cursorrules-prompt/.cursorrules)
 * [Astro](https://raw.githubusercontent.com/PatrickJS/awesome-cursorrules/refs/heads/main/rules/astro-typescript-cursorrules-prompt-file/.cursorrules)
 * [Vite](https://raw.githubusercontent.com/PatrickJS/awesome-cursorrules/refs/heads/main/rules/typescript-vite-tailwind-cursorrules-prompt-file/.cursorrules)

4. Save your rules file and Cursor will apply these rules to its AI suggestions

### Setting Up an OnchainKit Project

To create a new OnchainKit project:
#### Command```shell
npm create onchain@latest
```After creating your project, prompt to generate comprehensive documentation for your new OnchainKit project.

### Creating Project Documentation

A comprehensive instructions file helps AI tools understand your project better. This should be created early in your project and updated regularly.

**Ready-to-Use Prompt for Creating Instructions.md:**```Create a detailed instructions.md file for my project with the following sections:

1. Overview: Summarize the project goals, problem statements, and core functionality.
2. Tech Stack: List all technologies, libraries, frameworks with versions.
3. Project Structure: Document the file organization with explanations.
4. Coding Standards: Document style conventions, linting rules, and patterns.
5. User Stories: Key functionality from the user perspective.
6. APIs and Integrations: External services and how they connect.```<Note>
 Note: When planning architecture or making complex design decisions, use AI models with strong reasoning—like o4 mini or Claude 3.7 Sonnet. They excel at thinking through tradeoffs, edge cases, and long-term planning.
</Note>

## Effective Prompting Strategies

### Be Specific and Direct

Start with clear commands and be specific about what you want. AI tools respond best to clear, direct instructions.

**Example:** ❌ "Help me with my code"\
✅ "Refactor this authentication function to use async/await instead of nested then calls"

### Provide Context for Complex Tasks

**Ready-to-Use Prompt:**```I'm working on a onchainkit project using [frameworks/libraries]. I need your help with:

1. Problem: [describe specific issue]
2. Current approach: [explain what you've tried]
3. Constraints: [mention any technical limitations]
4. Expected outcome: [describe what success looks like]

Here's the relevant documentation @https://docs.base.org/onchainkit/getting-started

Here's the relevant code:
[paste your code]```### Ask for Iterations

Start simple and refine through iterations rather than trying to get everything perfect in one go.

**Ready-to-Use Prompt:**```Let's approach this step by step:
1. First, implement a basic version of [feature] with minimal functionality.
2. Then, we'll review and identify areas for improvement.
3. Next, let's add error handling and edge cases.
4. Finally, we'll optimize for performance.

Please start with step 1 now.```## Working with OnchainKit

### Leveraging LLMs.txt for Documentation

The OnchainKit project provides optimized documentation in the form of LLMs.txt files. These files are specifically formatted to be consumed by AI models:

1. Use [OnchainKit Documentation](/onchainkit/getting-started)
2. Find the component you want to implement
3. Copy the corresponding LLMs.txt url
4. Paste it into your prompt to provide context

**Example LLMs.txt Usage:**```I'm implementing a swap component with OnchainKit. Here's the relevant LLMs.txt:

@https://docs.base.org/onchainkit/getting-started

Based on this documentation, please show me how to implement a wallet connector that:
1. Swap from Base USDC to Base ETH.
2. Handles connection states properly.
3. Includes error handling.
4. Follows best practices for user experience.```### Component Integration Example

**Ready-to-Use Prompt for Token Balance Display:**```I need to implement a new feature in my project.

1. Shows the connected wallet's balance of our {ERC20 token}.
2. It updates when the balance changes.
3. Handles loading and error states appropriately.
4. Follows our project's coding standards.
5. Update the instructions.md to reflect this new implementation.```***\*update the prompt a token of your choice***

## Debugging with AI

### Effective Debugging Prompts

**Ready-to-Use Prompt for Bug Analysis:**```I'm encountering an issue with my code:

1. Expected behavior: [what should happen]
2. Actual behavior: [what's happening instead]
3. Error messages: [include any errors]
4. Relevant code: [paste the problematic code]

Please analyze this situation step by step and help me:
1. Identify potential causes of this issue
2. Suggest debugging steps to isolate the problem
3. Propose possible solutions```**Ready-to-Use Prompt for Adding Debug Logs:**```I need to debug the following function. Please add comprehensive logging statements that will help me trace:
1. Input values and their types
2. Function execution flow
3. Intermediate state changes
4. Output values or errors

Here's my code:
[paste your code]```### When You're Stuck

If you're uncertain how to proceed:

**Ready-to-Use Clarification Prompt:**```I'm unsure how to proceed with [specific task]. Here's what I know:
1. [context about the problem]
2. [what you've tried]
3. [specific areas where you need guidance]

What additional information would help you provide better assistance?```## Advanced Prompting Techniques

Modern AI assistants have capabilities that you can leverage with these advanced techniques:

1. **Step-by-step reasoning**: Ask the AI to work through problems systematically```Please analyze this code step by step and identify potential issues.```2. **Format specification**: Request specific formats for clarity```Please structure your response as a tutorial with code examples and explanations.```3. **Length guidance**: Indicate whether you want brief or detailed responses```Please provide a concise explanation in 2-3 paragraphs.```4. **Clarify ambiguities**: Help resolve unclear points when you receive multiple options```I notice you suggested two approaches. To clarify, I'd prefer to use the first approach with TypeScript.```## Best Practices Summary

1. **Understand context limitations**: Recognize that AI tools have finite context windows and prioritize information accordingly
2. **Provide relevant context**: Share code snippets, error messages, and project details that matter for your specific question
3. **Be specific in requests**: Clear, direct instructions yield better results than vague questions
4. **Break complex tasks into steps**: Iterative approaches often work better for complex problems
5. **Request explanations**: Ask the AI to explain generated code or concepts you don't understand
6. **Use formatting for clarity**: Structure your prompts with clear sections and formatting
7. **Reference documentation**: When working with specific libraries like OnchainKit, share relevant documentation
8. **Test and validate**: Always review and test AI-generated code before implementing
9. **Build on previous context**: Refer to earlier parts of your conversation when iterating
10. **Provide feedback**: Let the AI know what worked and what didn't to improve future responses






#### Ek Varyant 2



> Learn practical AI prompting techniques to enhance your coding workflow and get better results from AI coding assistants.

This guide helps developers leverage AI tools effectively in their coding workflow. Whether you're using Cursor, GitHub Copilot, or other AI assistants,
these strategies will help you get better results and integrate AI smoothly into your development process.

## Understanding Context Windows

### Why Context Matters

AI coding assistants have what's called a "context window" - the amount of text they can "see" and consider when generating responses. Think of it as the AI's working memory:

* Most modern AI assistants can process thousands of tokens (roughly 4-5 words per token)
* Everything you share and everything the AI responds with consumes this limited space
* Once the context window fills up, parts of your conversational history may be lost.

This is why providing relevant context upfront is crucial - the AI can only work with what it can "see" in its current context window.

### Optimizing for Context Windows

To get the most out of AI assistants:

1. **Prioritize relevant information**: Focus on sharing the most important details first.
2. **Remove unnecessary content**: Avoid pasting irrelevant code or documentation.
3. **Structure your requests**: Use clear sections and formatting to make information easy to process.
4. **Reference external resources**: For large codebases, consider sharing only the most relevant files.

For larger projects, create and reference a central documentation file that summarizes key information, rather than repeatedly explaining the same context.

## Setting Up AI Tools

### Configuring Cursor Rules

Cursor Rules allow you to provide consistent context to Cursor AI, making it more effective at understanding your codebase and providing relevant suggestions.

#### Creating Cursor Rules

1. Open the Command Palette in Cursor:
 * Mac:`Cmd + Shift + P`* Windows/Linux:`Ctrl + Shift + P`2. Search for "Cursor Rules" and select the option to create or edit rules

3. Add project-specific rules that help Cursor understand your project:

 * [Next.js](https://raw.githubusercontent.com/PatrickJS/awesome-cursorrules/refs/heads/main/rules/nextjs-tailwind-typescript-apps-cursorrules-prompt/.cursorrules)
 * [Astro](https://raw.githubusercontent.com/PatrickJS/awesome-cursorrules/refs/heads/main/rules/astro-typescript-cursorrules-prompt-file/.cursorrules)
 * [Vite](https://raw.githubusercontent.com/PatrickJS/awesome-cursorrules/refs/heads/main/rules/typescript-vite-tailwind-cursorrules-prompt-file/.cursorrules)

4. Save your rules file and Cursor will apply these rules to its AI suggestions

### Setting Up an OnchainKit Project

To create a new OnchainKit project:
#### Command```shell
npm create onchain@latest
```After creating your project, prompt to generate comprehensive documentation for your new OnchainKit project.

### Creating Project Documentation

A comprehensive instructions file helps AI tools understand your project better. This should be created early in your project and updated regularly.

**Ready-to-Use Prompt for Creating Instructions.md:**```Create a detailed instructions.md file for my project with the following sections:

1. Overview: Summarize the project goals, problem statements, and core functionality.
2. Tech Stack: List all technologies, libraries, frameworks with versions.
3. Project Structure: Document the file organization with explanations.
4. Coding Standards: Document style conventions, linting rules, and patterns.
5. User Stories: Key functionality from the user perspective.
6. APIs and Integrations: External services and how they connect.```<Note>
 Note: When planning architecture or making complex design decisions, use AI models with strong reasoning—like o4 mini or Claude 3.7 Sonnet. They excel at thinking through tradeoffs, edge cases, and long-term planning.
</Note>

## Effective Prompting Strategies

### Be Specific and Direct

Start with clear commands and be specific about what you want. AI tools respond best to clear, direct instructions.

**Example:** ❌ "Help me with my code"\
✅ "Refactor this authentication function to use async/await instead of nested then calls"

### Provide Context for Complex Tasks

**Ready-to-Use Prompt:**```I'm working on a onchainkit project using [frameworks/libraries]. I need your help with:

1. Problem: [describe specific issue]
2. Current approach: [explain what you've tried]
3. Constraints: [mention any technical limitations]
4. Expected outcome: [describe what success looks like]

Here's the relevant documentation @https://docs.base.org/onchainkit/getting-started

Here's the relevant code:
[paste your code]```### Ask for Iterations

Start simple and refine through iterations rather than trying to get everything perfect in one go.

**Ready-to-Use Prompt:**```Let's approach this step by step:
1. First, implement a basic version of [feature] with minimal functionality.
2. Then, we'll review and identify areas for improvement.
3. Next, let's add error handling and edge cases.
4. Finally, we'll optimize for performance.

Please start with step 1 now.```## Working with OnchainKit

### Leveraging LLMs.txt for Documentation

The OnchainKit project provides optimized documentation in the form of LLMs.txt files. These files are specifically formatted to be consumed by AI models:

1. Use [OnchainKit Documentation](/onchainkit/getting-started)
2. Find the component you want to implement
3. Copy the corresponding LLMs.txt url
4. Paste it into your prompt to provide context

**Example LLMs.txt Usage:**```I'm implementing a swap component with OnchainKit. Here's the relevant LLMs.txt:

@https://docs.base.org/onchainkit/getting-started

Based on this documentation, please show me how to implement a wallet connector that:
1. Swap from Base USDC to Base ETH.
2. Handles connection states properly.
3. Includes error handling.
4. Follows best practices for user experience.```### Component Integration Example

**Ready-to-Use Prompt for Token Balance Display:**```I need to implement a new feature in my project.

1. Shows the connected wallet's balance of our {ERC20 token}.
2. It updates when the balance changes.
3. Handles loading and error states appropriately.
4. Follows our project's coding standards.
5. Update the instructions.md to reflect this new implementation.```***\*update the prompt a token of your choice***

## Debugging with AI

### Effective Debugging Prompts

**Ready-to-Use Prompt for Bug Analysis:**```I'm encountering an issue with my code:

1. Expected behavior: [what should happen]
2. Actual behavior: [what's happening instead]
3. Error messages: [include any errors]
4. Relevant code: [paste the problematic code]

Please analyze this situation step by step and help me:
1. Identify potential causes of this issue
2. Suggest debugging steps to isolate the problem
3. Propose possible solutions```**Ready-to-Use Prompt for Adding Debug Logs:**```I need to debug the following function. Please add comprehensive logging statements that will help me trace:
1. Input values and their types
2. Function execution flow
3. Intermediate state changes
4. Output values or errors

Here's my code:
[paste your code]```### When You're Stuck

If you're uncertain how to proceed:

**Ready-to-Use Clarification Prompt:**```I'm unsure how to proceed with [specific task]. Here's what I know:
1. [context about the problem]
2. [what you've tried]
3. [specific areas where you need guidance]

What additional information would help you provide better assistance?```## Advanced Prompting Techniques

Modern AI assistants have capabilities that you can leverage with these advanced techniques:

1. **Step-by-step reasoning**: Ask the AI to work through problems systematically```Please analyze this code step by step and identify potential issues.```2. **Format specification**: Request specific formats for clarity```Please structure your response as a tutorial with code examples and explanations.```3. **Length guidance**: Indicate whether you want brief or detailed responses```Please provide a concise explanation in 2-3 paragraphs.```4. **Clarify ambiguities**: Help resolve unclear points when you receive multiple options```I notice you suggested two approaches. To clarify, I'd prefer to use the first approach with TypeScript.```## Best Practices Summary

1. **Understand context limitations**: Recognize that AI tools have finite context windows and prioritize information accordingly
2. **Provide relevant context**: Share code snippets, error messages, and project details that matter for your specific question
3. **Be specific in requests**: Clear, direct instructions yield better results than vague questions
4. **Break complex tasks into steps**: Iterative approaches often work better for complex problems
5. **Request explanations**: Ask the AI to explain generated code or concepts you don't understand
6. **Use formatting for clarity**: Structure your prompts with clear sections and formatting
7. **Reference documentation**: When working with specific libraries like OnchainKit, share relevant documentation
8. **Test and validate**: Always review and test AI-generated code before implementing
9. **Build on previous context**: Refer to earlier parts of your conversation when iterating
10. **Provide feedback**: Let the AI know what worked and what didn't to improve future responses

# Testing with OnchainTestKit

> Learn how to write end-to-end tests for your OnchainKit applications

Building reliable onchain applications requires comprehensive testing. OnchainTestKit is a type-safe framework designed specifically for testing blockchain applications built with OnchainKit, providing seamless integration with Playwright for browser automation and wallet interactions.

## What is OnchainTestKit?

[OnchainTestKit](https://github.com/coinbase/onchaintestkit) is an end-to-end testing framework that automates:

* Wallet connections (MetaMask, Coinbase Wallet)
* Transaction flows and approvals
* Network switching
* Smart contract interactions
* Token swaps and minting
* Gas sponsorship testing

## Why Use OnchainTestKit?

Testing blockchain applications manually is time-consuming and error-prone. OnchainTestKit provides:

* **Type Safety**: Full TypeScript support with compile-time error checking
* **Wallet Automation**: Programmatic control over wallet interactions
* **Parallel Testing**: Run multiple tests simultaneously with isolated environments
* **Network Management**: Built-in support for local Anvil nodes and fork testing
* **OnchainKit Integration**: Designed to work seamlessly with OnchainKit components

## Want to learn more?

Check out [the full documentation](https://onchaintestkit.xyz/) for detailed guides on installation, configuration, and writing tests!

## Architecture```mermaid
 flowchart TD
 subgraph "Test Runner"
 A[Playwright Test]
 B[Onchain Test Kit]
 end
 subgraph Blockchain
 C["LocalNodeManager<br/>(Anvil Node)"]
 D["Wallet Extension<br/>(MetaMask/Coinbase/Etc...)"]
 end
 A --> B
 B -- manages --> D
 B -- manages --> C
 D -- interacts --> C
 B -- configures --> C
 B -- automates --> D
````

````mermaid
 flowchart TD
 subgraph Test Environment
 A[Playwright Test]
 B[LocalNodeManager]
 C[SmartContractManager]
 D[ProxyDeployer]
 E[Anvil Node]
 end
 A -->|uses| B
 A -->|uses| C
 C -->|uses| D
 B -->|manages| E
 C -->|deploys contracts| E
 D -->|deploys proxy| E
```## Key Features

<AccordionGroup>
 <Accordion title="Playwright Integration">
 Automate browser-based wallet and dApp interactions with the power of Playwright's testing framework.
 </Accordion>

 <Accordion title="Multi-Wallet Support">
 Built-in support for MetaMask and Coinbase Wallet, with an extensible architecture for adding more wallets.
 </Accordion>

 <Accordion title="Smart Action Handling">
 Automate connect, transaction, signature, approval, and network switching flows with simple APIs.
 </Accordion>

 <Accordion title="Network Management">
 Use local Anvil nodes or remote RPC endpoints, with dynamic port allocation for parallel test execution.
 </Accordion>

 <Accordion title="Type Safety">
 Full TypeScript support for all configuration and test APIs, catching errors at compile time.
 </Accordion>

 <Accordion title="Fluent Configuration">
 Builder pattern for intuitive wallet and node setup, making configuration readable and maintainable.
 </Accordion>
</AccordionGroup>

## Next Steps

* Install OnchainTestKit:`yarn add -D @coinbase/onchaintestkit`* Check out the [OnchainTestKit repository](https://github.com/coinbase/onchaintestkit)
* See [example tests](https://github.com/coinbase/onchaintestkit/tree/master/example/frontend/e2e)
* Read the [Cookbook examples](/cookbook/testing-onchain-apps) for more test scenarios
* Access the [full docs here](https://onchaintestkit.xyz/)

# isBase

The`isBase`utility is designed to verify if the chain id is a valid Base or Base Sepolia chain id.

## Usage

<CodeGroup>
#### Code```tsx
 import { isBase } from '@coinbase/onchainkit';

 // Base Mainnet (chain ID: 8453)
 isBase({ chainId: 8453 }); // returns true

 // Base Sepolia (chain ID: 84532)
 isBase({ chainId: 84532 }); // returns true

 // Ethereum (chain ID: 1)
 isBase({ chainId: 1 }); // returns false
```#### Code```ts
 true; // When chainId is 8453 (Base Mainnet) or 84532 (Base Sepolia)
 false; // For all other chain IDs
```</CodeGroup>

## Returns`boolean`- Returns`true`if the chain id is Base or Base Sepolia, otherwise`false`.

## Parameters

[`IsBaseOptions`](./types#isbaseoptions) - See [`IsBaseOptions`](./types#isbaseoptions) for more details.

# isValidAAEntrypoint

The `isValidAAEntrypoint`utility is designed to verify the Account-Abstraction entrypoint before sponsoring a transaction.

## Usage

<CodeGroup>
#### Code```tsx
 import { isValidAAEntrypoint } from '@coinbase/onchainkit/wallet';

 const AAImplementationAddress = '0x123';
 const isValid = isValidAAEntrypoint({ entrypoint: AAImplementationAddress });

 if (isValid) {
console.log('The entrypoint is valid.');
 } else {
console.log('Invalid entrypoint.');
 }
```#### Code```ts
 true;
```</CodeGroup>

## Returns`boolean`- Returns`true`if the account abstraction entrypoint address is v06, otherwise`false`.

## Parameters

[`isValidAAEntrypointOptions`](/onchainkit/wallet/types#isvalidaaentrypointoptions)

# isWalletACoinbaseSmartWallet

The `isWalletACoinbaseSmartWallet`utility is designed to verify if a given sender address is a Smart Wallet proxy with the expected implementation before sponsoring a transaction.

## Usage

<CodeGroup>
#### Code```tsx
 // @noErrors: 2352 2801 2719 2305
 import { isWalletACoinbaseSmartWallet } from '@coinbase/onchainkit/wallet';
 import { http } from 'viem';
 import { baseSepolia } from 'viem/chains';
 import type { UserOperation } from 'permissionless';
 import { type PublicClient, createPublicClient } from 'viem';

 export const publicClient = createPublicClient({
chain: baseSepolia,
transport: http,
 });

 const userOperation = { sender: '0x123' } as UserOperation<'v0.6'>;

 if (isWalletACoinbaseSmartWallet({ client: publicClient, userOp: userOperation })) {
console.log('The sender address is a valid smart wallet proxy.');
 } else {
console.log('The sender address is not a valid smart wallet proxy.');
 }
```#### Code```ts
 true;
````

</CodeGroup>

## Returns

[`IsWalletACoinbaseSmartWalletResponse`](/onchainkit/wallet/types#iswalletacoinbasesmartwalletresponse)

## Parameters

[`isWalletACoinbaseSmartWalletOptions`](/onchainkit/wallet/types#iswalletacoinbasesmartwalletoptions)

# API types

> Glossary of Types in APIs.

## `APIError`#### Code```ts

type APIError = {
code: string; // The Error code
error: string; // The Error long message
message: string; // The Error short message
};
``##`BuildPayTransactionParams`#### Code``ts
type BuildPayTransactionParams = {
address: Address; // The address of the wallet paying
chainId: number; // The Chain ID of the payment Network (only Base is supported)
chargeId: string; // The ID of the Commerce Charge to be paid
};
``##`BuildPayTransactionResponse`#### Code``ts
type BuildPayTransactionResponse = PayTransaction | APIError;
``##`BuildSwapTransaction`#### Code``ts
type BuildSwapTransaction = {
approveTransaction?: Transaction; // ERC20 approve transaction which allows token holders to authorize spending
fee: Fee; // The fee for the swap
quote: SwapQuote; // The quote for the swap
transaction: Transaction; // The object developers should pass into Wagmi's signTransaction
warning?: QuoteWarning; // The warning associated with the swap
};
``##`BuildSwapTransactionParams`#### Code``ts
type BuildSwapTransactionParams = GetSwapQuoteParams & {
fromAddress: Address; // The address of the user
};
``##`BuildSwapTransactionResponse`#### Code``ts
type BuildSwapTransactionResponse = BuildSwapTransaction | APIError;
``##`GetSwapQuoteParams`#### Code``ts
type GetSwapQuoteParams = {
amount: string; // The amount to be swapped
amountReference?: string; // The reference amount for the swap
from: Token; // The source token for the swap
isAmountInDecimals?: boolean; // Whether the amount is in decimals
maxSlippage?: string; // The slippage of the swap
to: Token; // The destination token for the swap
useAggregator: boolean; // Whether to use a DEX aggregator
};
``##`GetSwapQuoteResponse`#### Code``ts
type GetSwapQuoteResponse = SwapQuote | APIError;
``##`GetTokensOptions`#### Code``ts
type GetTokensOptions = {
limit?: string; // The maximum number of tokens to return (default: 50)
page?: string; // The page number to return (default: 1)
search?: string; // A string to search for in the token name, symbol or address
};
``##`GetTokensResponse`#### Code``ts
type GetTokensResponse = Token[] | APIError;
``##`GetTokenDetailsParams`#### Code``ts
type GetTokenDetailsParams = {
contractAddress: Address;
tokenId?: string;
};
``##`GetTokenDetailsResponse`#### Code``ts
type GetTokenDetailsResponse = TokenDetails | APIError;
``##`GetMintDetailsParams`#### Code``ts
type GetMintDetailsParams = {
contractAddress: Address;
takerAddress?: Address;
tokenId?: string;
};
``##`GetMintDetailsResponse`#### Code``ts
type GetMintDetailsResponse = MintDetails | APIError;
``##`BuildMintTransactionParams`#### Code``ts
type BuildMintTransactionParams = {
mintAddress: Address;
takerAddress: Address;
tokenId?: string;
quantity: number;
network?: string;
};
``##`BuildMintTransactionResponse`#### Code``ts
type BuildMintTransactionResponse = MintTransaction | APIError;
``##`GetPortfoliosParams`#### Code``ts
type GetPortfoliosParams = {
addresses: Address[] | null | undefined;
};
``##`GetPortfoliosResponse`#### Code``ts
type GetPortfoliosResponse = {
portfolios: Portfolio[];
};

````# Identity components & utilities Types

> Glossary of Types in Identity components & utilities.

##`AddressReact`#### Code```ts
type AddressReact = {
 address?: Address | null; // The Ethereum address to render.
 className?: string; // Optional className override for top span element.
 isSliced?: boolean; // Determines if the displayed address should be sliced.
 hasCopyAddressOnClick?: boolean; // Defaults to true. Optional boolean to disable copy address on click functionality.
};
```##`Attestation`#### Code```ts
type Attestation = {
 attester: Address; // the attester who created the attestation.
 decodedDataJson: string; // The attestation data decoded to JSON.
 expirationTime: number; // The Unix timestamp when the attestation expires (0 for no expiration).
 id: string; // The unique identifier of the attestation.
 recipient: Address; // The Ethereum address of the recipient of the attestation.
 revocationTime: number; // The Unix timestamp when the attestation was revoked, if applicable.
 revoked: boolean; // A boolean indicating whether the attestation is revocable or not.
 schemaId: EASSchemaUid; // The schema identifier associated with the attestation.
 time: number; // The Unix timestamp when the attestation was created.
};
```##`AvatarReact`#### Code```ts
type AvatarReact = {
 address?: Address | null; // The Ethereum address to fetch the avatar for.
 chain?: Chain; // Optional chain for domain resolution
 className?: string; // Optional className override for top div element.
 loadingComponent?: JSX.Element; // Optional custom component to display while the avatar data is loading.
 defaultComponent?: JSX.Element; // Optional custom component to display when no ENS name or avatar is available.
 children?: ReactNode; // Optional attestation by passing Badge component as its children
} & ImgHTMLAttributes<HTMLImageElement>; // Optional additional image attributes to apply to the avatar.
```##`BadgeReact`#### Code```ts
type BadgeReact = {
 className?: string; // Optional className override for top span element.
 tooltip?: boolean | string; // Controls whether the badge shows a tooltip on hover. When true, the tooltip displays the attestation's name. When a string is provided, that text overrides the default display. Defaults to false.
};
```##`BaseMainnetName`#### Code```ts
export type BaseMainnetName = `${string}.base.eth`;
```##`Basename`#### Code```ts
type Basename = BaseMainnetName | BaseSepoliaName;
```##`BaseSepoliaName`#### Code```ts
type BaseSepoliaName = `${string}.basetest.eth`;
```##`EASSchemaUid`#### Code```ts
type EASSchemaUid = `0x${string}`;
```##`EASChainDefinition`#### Code```ts
type EASChainDefinition = {
 easGraphqlAPI: string; // EAS GraphQL API endpoint
 id: number; // blockchain source id
 schemaUids: EASSchemaUid[]; // Array of EAS Schema UIDs
};
```##`EthBalanceReact`#### Code```ts
type EthBalanceReact = {
 address?: Address;
 className?: string;
};
```##`GetAddress`#### Code```ts
type GetAddress = {
 name: string | Basename; // Name to resolve
 chain?: Chain; // Optional chain for domain resolution
};
```##`GetAddressReturnType`#### Code```ts
type GetAddressReturnType = Address | null;
```##`GetAttestationsOptions`#### Code```ts
type GetAttestationsOptions = {
 schemas?: EASSchemaUid[]; // Array of schema UIDs to filter by
 revoked?: boolean; // Filter by revocation status
 expirationTime?: number; // Filter by expiration time
 limit?: number; // Limit number of results
};
```##`GetAvatar`#### Code```ts
type GetAvatar = {
 ensName: string; // The ENS name to fetch the avatar for.
 chain?: Chain; // Optional chain for domain resolution
};
```##`GetAvatarReturnType`#### Code```ts
type GetAvatarReturnType = string | null;
```##`GetName`#### Code```ts
type GetName = {
 address: Address;
 chain?: Chain;
};
```##`GetNameReturnType`#### Code```ts
type GetNameReturnType = string | null;
```##`GetNames`#### Code```ts
type GetNames = {
 addresses: Address[]; // Array of Ethereum addresses to resolve names for
 chain?: Chain; // Optional chain for domain resolution
};
```##`IdentityCardReact`#### Code```ts
type IdentityCardReact = {
 address?: Address;
 chain?: Chain;
 className?: string;
 schemaId?: Address | null;
 badgeTooltip?: boolean | string; // Controls whether the badge shows a tooltip on hover. When true, the tooltip displays the attestation's name. When a string is provided, that text overrides the default display. Defaults to false.
};
```##`IdentityContextType`#### Code```ts
type IdentityContextType = {
 address: Address; // The Ethereum address to fetch the avatar and name for.
 schemaId?: Address | null; // The Ethereum address of the schema to use for EAS attestation.
};
```##`IdentityReact`#### Code```ts
type IdentityReact = {
 address?: Address; // The Ethereum address to fetch the avatar and name for.
 chain?: Chain; // Optional chain for domain resolution
 children: ReactNode;
 className?: string; // Optional className override for top div element.
 schemaId?: Address | null; // The Ethereum address of the schema to use for EAS attestation.
 hasCopyAddressOnClick?: boolean; // Optional boolean to disable copy address on click functionality.
};
```##`NameReact`#### Code```ts
type NameReact = {
 address?: Address | null; // Ethereum address to be displayed.
 children?: ReactNode; // Optional attestation by passing Badge component as its children
 chain?: Chain; // Optional chain for domain resolution
 className?: string; // Optional className override for top span element.
} & HTMLAttributes<HTMLSpanElement>; // Optional additional span attributes to apply to the name.
```##`UseAddressOptions`#### Code```ts
type UseAddressOptions = {
 name: string | Basename; // The ENS or Basename for which the Ethereum address is to be fetched
 chain?: Chain; // Optional chain for domain resolution
};
```##`UseAvatarOptions`#### Code```ts
type UseAvatarOptions = {
 ensName: string;
 chain?: Chain; // Optional chain for domain resolution
};
```##`UseAvatarsOptions`#### Code```ts
type UseAvatarsOptions = {
 ensNames: string[]; // Array of ENS names to resolve avatars for
 chain?: Chain; // Optional chain for domain resolution
};
```##`UseNameOptions`#### Code```ts
type UseNameOptions = {
 address: Address; // The address for which the ENS or Basename is to be fetched.
 chain?: Chain; // Optional chain for domain resolution
};
```##`UseNamesOptions`#### Code```ts
type UseNamesOptions = {
 addresses: Address[]; // Array of addresses to resolve ENS or Basenames for
 chain?: Chain; // Optional chain for domain resolution
};
```# Signature components & utilities Types

> Glossary of Types in Signature components & utilities.

##`LifecycleStatus`#### Code```ts
type LifecycleStatus =
 | {
 statusName: 'init';
 statusData: null;
}
 | {
 statusName: 'error';
 statusData: APIError;
}
 | {
 statusName: 'pending';
 statusData: {
type: MessageType;
 };
}
 | {
 statusName: 'success';
 statusData: {
signature: `0x${string}`;
type: MessageType;
 };
}
 | {
 statusName: 'reset';
 statusData: null;
};
```##`SignatureReact`#### Code```ts
type SignatureReact = {
 chainId?: number;
 className?: string;
 onSuccess?: (signature: string) => void;
 onStatus?: (status: LifecycleStatus) => void;
 onError?: (error: APIError) => void;
 resetAfter?: number;
} & (
 | {
 domain?: SignTypedDataParameters['domain'];
 types: SignTypedDataParameters['types'];
 message: SignTypedDataParameters['message'];
 primaryType: SignTypedDataParameters['primaryType'];
}
 | {
 message: SignMessageParameters['message'];
 domain?: never;
 types?: never;
 primaryType?: never;
}
) &
 (
| {
children: React.ReactNode;
label?: never;
disabled?: never;
 }
| {
children?: never;
label?: React.ReactNode;
disabled?: boolean;
 }
 );
```##`SignatureButtonProps`#### Code```ts
type SignatureButtonProps = {
 className?: string;
 disabled?: boolean;
 label?: ReactNode;
 connectLabel?: ReactNode;
 errorLabel?: ReactNode;
 successLabel?: ReactNode;
 pendingLabel?: ReactNode;
};
```##`SignatureStatusProps`#### Code```ts
type SignatureStatusProps = {
 children?: React.ReactNode;
 className?: string;
};
```##`SignatureToastProps`#### Code```ts
type SignatureToastProps = {
 children?: React.ReactNode;
 className?: string;
 durationMs?: number;
 position?: 'bottom-center' | 'top-center' | 'top-right' | 'bottom-right';
};
```##`SignatureIconProps`#### Code```ts
type SignatureIconProps = {
 className?: string;
};
```##`SignatureLabelProps`#### Code```ts
type SignatureLabelProps = {
 className?: string;
};
```##`MessageType`#### Code```ts
enum MessageType {
 SIGNABLE_MESSAGE = 'signable_message',
 TYPED_DATA = 'typed_data',
 INVALID = 'invalid'
}
```##`ValidateMessageResult`#### Code```ts
type ValidateMessageResult =
 | { type: MessageType.TYPED_DATA; data: SignTypedDataParameters }
 | { type: MessageType.SIGNABLE_MESSAGE; data: SignMessageParameters }
 | { type: MessageType.INVALID; data: null };
```##`MessageData`#### Code```ts
type MessageData = {
 domain?: SignTypedDataParameters['domain'];
 types?: SignTypedDataParameters['types'];
 message: SignTypedDataParameters['message'] | SignMessageParameters['message'];
 primaryType?: SignTypedDataParameters['primaryType'];
};
```##`SignatureProviderProps`#### Code```ts
type SignatureProviderProps = {
 children: React.ReactNode;
 onSuccess?: (signature: string) => void;
 onError?: (error: APIError) => void;
 onStatus?: (status: LifecycleStatus) => void;
 resetAfter?: number;
} & MessageData;
```# Wallet components & utilities types

> Glossary of Types in Wallet components & utilities.

##`ConnectWalletReact`#### Code```ts
type ConnectWalletReact = {
 children?: React.ReactNode; // Children can be utilized to display customized content when the wallet is connected.
 className?: string; // Optional className override for button element
 text?: string; // Optional text override for button. Note: Prefer using `disconnectedLabel`prop instead as this will be deprecated in a future version.
 disconnectedLabel?: React.ReactNode; // Optional text override for button.
 onConnect?: => void; // Optional callback function that is called when the wallet is connected. Can be used to trigger SIWE prompts or other actions.
};```##`IsValidAAEntrypointOptions`#### Code```ts
export type IsValidAAEntrypointOptions = {
 entrypoint: string;
};
```##`IsWalletACoinbaseSmartWalletOptions`#### Code```ts
export type IsWalletACoinbaseSmartWalletOptions = {
 client: PublicClient;
 userOp: UserOperation<'v0.6'>;
};
```##`IsWalletACoinbaseSmartWalletResponse`#### Code```ts
export type IsWalletACoinbaseSmartWalletResponse =
 | { isCoinbaseSmartWallet: true }
 | { isCoinbaseSmartWallet: false; error: string; code: string };
```##`WalletContextType`#### Code```ts
type WalletContextType = {
 address?: Address | null; // The Ethereum address to fetch the avatar and name for.
 chain?: Chain; // Optional chain for domain resolution
 isConnectModalOpen: boolean;
 setIsConnectModalOpen: Dispatch<SetStateAction<boolean>>;
 isSubComponentOpen: boolean;
 setIsSubComponentOpen: Dispatch<SetStateAction<boolean>>;
 isSubComponentClosing: boolean;
 setIsSubComponentClosing: Dispatch<SetStateAction<boolean>>;
 handleClose: => void;
 connectRef: React.RefObject<HTMLDivElement>;
 showSubComponentAbove: boolean;
 alignSubComponentRight: boolean;
 activeFeature: WalletAdvancedFeature | null;
 setActiveFeature: Dispatch<SetStateAction<WalletAdvancedFeature | null>>;
 isActiveFeatureClosing: boolean;
 setIsActiveFeatureClosing: Dispatch<SetStateAction<boolean>>;
 tokenBalances: PortfolioTokenWithFiatValue[] | undefined;
 portfolioFiatValue: number | undefined;
 isFetchingPortfolioData: boolean;
 portfolioDataUpdatedAt: number | undefined;
 refetchPortfolioData: => Promise<QueryObserverResult<Portfolio, Error>>;
 animations: {
container: string;
content: string;
 };
};
```##`WalletReact`#### Code```ts
type WalletReact = {
 children?: React.ReactNode;
 className?: string;
} & (
 | { draggable?: true; draggableStartingPosition?: { x: number; y: number } }
 | { draggable?: false; draggableStartingPosition?: never }
); // discriminated union to allow for optional draggable and draggableStartingPosition
```##`WalletDropdownBasenameReact`#### Code```ts
type WalletDropdownBasenameReact = {
 className?: string; // Optional className override for the element
};
```##`WalletDropdownReact`#### Code```ts
type WalletDropdownReact = {
 children?: React.ReactNode;
 className?: string; // Optional className override for top div element;
 classNames?: {
container?: string;
qr?: WalletAdvancedQrReceiveProps['classNames'];
swap?: WalletAdvancedSwapProps['classNames'];
 };
 swappableTokens?: Token[];
};
```##`WalletDropdownDisconnectReact`#### Code```ts
export type WalletDropdownDisconnectReact = {
 className?: string; // Optional className override for the element
 text?: string; // Optional text override for the button
};
```##`WalletDropdownFundLinkReact`#### Code```ts
export type WalletDropdownFundLinkReact = {
 className?: string; // Optional className override for the element
 icon?: ReactNode; // Optional icon override
 openIn?: 'popup' | 'tab'; // Whether to open the funding flow in a tab or a popup window
 popupSize?: 'sm' | 'md' | 'lg'; // Size of the popup window if `openIn`is set to`popup`rel?: string; // Specifies the relationship between the current document and the linked document
 target?: string; // Where to open the target if`openIn`is set to tab
 text?: string; // Optional text override
};```##`WalletDropdownLinkReact`#### Code```ts
export type WalletDropdownLinkReact = {
 children: string;
 className?: string; // Optional className override for the element
 href: string;
 icon?: 'wallet' & ReactNode;
 rel?: string;
 target?: string;
};
```##`WalletAdvancedReact`#### Code```ts
export type WalletAdvancedReact = {
 children?: React.ReactNode;
 swappableTokens?: Token[];
};
```##`WalletAdvancedContextType`#### Code```ts
export type WalletAdvancedContextType = {
 showSwap: boolean;
 setShowSwap: Dispatch<SetStateAction<boolean>>;
 isSwapClosing: boolean;
 setIsSwapClosing: Dispatch<SetStateAction<boolean>>;
 showQr: boolean;
 setShowQr: Dispatch<SetStateAction<boolean>>;
 isQrClosing: boolean;
 setIsQrClosing: Dispatch<SetStateAction<boolean>>;
 tokenBalances: PortfolioTokenWithFiatValue[] | undefined;
 portfolioFiatValue: number | undefined;
 isFetchingPortfolioData: boolean;
 portfolioDataUpdatedAt: number | undefined;
 refetchPortfolioData: => Promise<
QueryObserverResult<PortfolioTokenBalances, Error>
 >;
 animations: {
container: string;
content: string;
 };
};
```# Contribution Guide · OnchainKit

> Learn how to contribute to OnchainKit

Welcome to OnchainKit! So you want to contribute to this project? You came to the right place.

In this guide, you will learn how to:

* [Set up this project](#setup)
* [Navigate the codebase](#codebase)
* [Accomplish various workflows](#workflows)
* [Submit a feature request](#feature-request)

## Setup

### Clone the repo
#### Command```bash
git clone git@github.com:coinbase/onchainkit.git
```### Install Node and pnpm

Use nvm, mise, n or your favorite version manager to install Node.js.

For pnpm, see the installation instructions on the [pnpm website](https://pnpm.io/installation)

### Install dependencies

From the root of the repository:
#### Command```bash
pnpm install
```## Codebase

This project is a monorepo managed with pnpm. The`@coinbase/onchainkit`package is located in:
#### Command```bash
packages/onchainkit/
```Here is a rough layout of the codebase:
#### Command```bash
packages/onchainkit/
└── src/
   ├── api/ - API related components and functions
   ├── core/ - Files with zero dependencies
   ├── styles/ - Styles
   │   ├── index-with-tailwind.css - CSS entrypoint
   ├── {Component}/ - Component folder
   │   ├── components/ - React components
   │   │   ├── {Name}.tsx
   │   │   ├── {Name}.test.tsx
   │   │   └── {Name}.css
   │   ├── core/ - Utility functions
   │   ├── index.ts - Entrypoint for the folder
   │   └── types.ts - Export types
   │
   ├── index.ts - Main package entry point
   ├── types.ts - Core types
   └── OnchainKitProvider.tsx - OnchainKit provider
```## Workflows

### Development

To work on OnchainKit components with live UI feedback:
#### Command```bash
pnpm f:play dev
```This will build the OnchainKit package in watch mode, and start a development environment (the playground) where you can see your components in action.

As you make changes, the playground will update automatically.

Navigate to [http://localhost:3000 to open the playground.

### Building

To build the package:
#### Command```bash
pnpm f:ock build
```### Testing

Write and update existing unit tests. You can run tests with:
#### Command```bash
pnpm f:ock test
```For watching file changes and rerunning tests automatically:
#### Command```bash
pnpm f:ock test:watch
```We expect 100% code coverage for any updates. You can get coverage information with:
#### Command```bash
pnpm f:ock test:coverage
```If the coverage drops below 100%, look at the coverage report generated by the above command with:
#### Command```bash
open coverage/index.html
```### Updating changelog

To update the change log, run:
#### Command```bash
pnpm changeset
```Select`minor`and use the following format for the summary:```markdown
- **feat**: feature update information. By @your-github-id #XX (XX is the PR number)
```Possible values are:

*`feat`*`fix`*`docs`*`chore`## Feature request

Have a component in mind that we are not supporting yet? You can submit a feature request to our [Github](https://github.com/coinbase/onchainkit/issues Create a **"New issue"** and label it "Feature Request: ...".

## MINI APPS
## Quickstart

# Migrate an Existing App

> Quickly migrate your existing app to a mini app, preview it in Base Build, and publish to the Base app.



**Prerequisites**

* You have an existing web app
* You have a Base app account


### Step: Add the MiniApp SDK
<CodeGroup>
#### Command```bash
 npm install @farcaster/miniapp-sdk
```#### Command```bash
 pnpm add @farcaster/miniapp-sdk
```#### Command```bash
 yarn add @farcaster/miniapp-sdk
```</CodeGroup>

### Step: Trigger App Display
Once your app has loaded, call`sdk.actions.ready`to hide the loading splash screen and display your app.

 <Tabs>
 <Tab title="Vanilla JS">```javascript
import { sdk } from '@farcaster/miniapp-sdk';

// Once app is ready to be displayed
await sdk.actions.ready;
```</Tab>

 <Tab title="React">
 In React apps, call`ready`inside a`useEffect`hook to prevent it from running on every re-render. Call`ready`as soon as possible and avoid jitter and content reflows.
#### Code```typescript
import { sdk } from '@farcaster/miniapp-sdk';
import { useEffect } from 'react';

function App {
useEffect( => {
 sdk.actions.ready;
}, []);

return(...your app content goes here...)
}

export default App;
```</Tab>
 </Tabs>

### Step: Host the Manifest
Create a file available at`https://www.your-domain.com/.well-known/farcaster.json`.

 <Tabs>
 <Tab title="Vanilla JS">
 Create the manifest file in your project at `/public/.well-known/farcaster.json`.
 </Tab>

 <Tab title="Next.js">
 Create a Next.js route to host your manifest file
#### Code
```typescript
function withValidProperties(properties: Record<string, undefined | string | string[]>) {
return Object.fromEntries(
Object.entries(properties).filter(([_, value]) => (Array.isArray(value) ? value.length > 0 : !!value))
);
}

export async function GET {
const URL = process.env.NEXT_PUBLIC_URL as string;
return Response.json(paste_manifest_json_object_here); // see the next step for the manifest_json_object
}
```</Tab>
 </Tabs>

### Step: Update the Manifest
Copy the example manifest below and add it to the file created in the previous step. Update each field in the`miniapp`.

 For details on each field, see the [field reference](/mini-apps/features/manifest#field-reference)

 ### Example Manifest
#### JSON
```json
{
 "accountAssociation": { // these will be added in step 5
"header": "",
"payload": "",
"signature": ""
 },
 "baseBuilder": {
"ownerAddress": "0x" // add your Base Account address here
 },
 "miniapp": {
"version": "1",
"name": "Example Mini App",
"homeUrl": "https://ex.co
"iconUrl": "https://ex.co/i.png
"splashImageUrl": "https://ex.co/l.png
"splashBackgroundColor": "#000000",
"webhookUrl": "https://ex.co/api/webhook
"subtitle": "Fast, fun, social",
"description": "A fast, fun way to challenge friends in real time.",
"screenshotUrls": [
 "https://ex.co/s1.png
 "https://ex.co/s2.png
 "https://ex.co/s3.png
],
"primaryCategory": "social",
"tags": ["example", "miniapp", "baseapp"],
"heroImageUrl": "https://ex.co/og.png
"tagline": "Play instantly",
"ogTitle": "Example Mini App",
"ogDescription": "Challenge friends in real time.",
"ogImageUrl": "https://ex.co/og.png
"noindex": true
 }
}
```### Step: Create accountAssociation Credentials
The`accountAssociation`fields in the manifest are used to verify ownership of your app. You can generate these fields on Base Build.

 1. Ensure all changes are live so that the Manifest file is available at your app's url.
 2. Navigate to the Base Build [Account association tool](https://www.base.dev/preview?tab=account)
 3. Paste your domain in the`App URL`field (ex: sample-url.vercel.app) and click "Submit"
 4. Click on the "Verify" button that appears and follow the instructions to generate the`accountAssociation`fields.
 5. Copy the`accountAssociation`fields and paste them into the manifest file you added in the previous step.
#### JSON```json
{
 "accountAssociation": {
"header": "eyJmaWQiOjkxNTIsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHgwMmVmNzkwRGQ3OTkzQTM1ZkQ4NDdDMDUzRURkQUU5NDBEMDU1NTk2In0",
"payload": "eyJkb21haW4iOiJhcHAuZXhhbXBsZS5jb20ifQ",
"signature":
<Info>
 Note: Because you are signing with your Base Account, the `signature`field will be significantly longer than if you were to sign directly with your Farcaster custody wallet.
</Info>

### Step: Add Embed Metadata
Update your index.html file to include the`fc:miniapp`metadata. This is used to generate the rich embeds when your app is shared and is required for your app to display.

<Tabs>
 <Tab title="Vanilla JS">
Add directly to your index.html file.
#### Code```html
 <meta name="fc:miniapp" content='{
 "version":"next",
 "imageUrl":"https://your-app.com/embed-image
 "button":{
 "title":"Play Now",
 "action":{
 "type":"launch_miniapp",
 "name":"Your App Name",
 "url":"https://your-app.com
 }
 }
 }' />
```</Tab>

 <Tab title="Next.js">
Use the`generateMetadata`function to add the`fc:miniapp`metadata.
#### Code```typescript
 export async function generateMetadata: Promise<Metadata> {
 return {
 other: {
 'fc:miniapp': JSON.stringify({
 version: 'next',
 imageUrl: 'https://your-app.com/embed-image
 button: {
 title: `Launch Your App Name`,
 action: {
 type: 'launch_miniapp',
 name: 'Your App Name',
 url: 'https://your-app.com
 splashImageUrl: 'https://your-app.com/splash-image
 splashBackgroundColor: '#000000',
 },
 },
 }),
 },
 };
 }
```</Tab>
</Tabs>

### Step: Push to Production
Ensure all changes are live.

### Step: Preview Your App
Use the Base Build [Preview tool](https://www.base.dev/preview) to validate your app.

1. Add your app URL to view the embeds and click the launch button to verify the app launches as expected.
2. Use the "Account association" tab to verify the association credentials were created correctly.
3. Use the "Metadata" to see the metadata added from the manifest and identify any missing fields.

<video autoPlay muted loop playsInline src="https://mintcdn.com/base-a060aa97/hlNNNlUJtlshvXQM/videos/mini-apps/basebuildpreview.mp4?fit=max&auto=format&n=hlNNNlUJtlshvXQM&q=85&s=65a4cb8ce13c9940cba6aee73b8ececb data-path="videos/mini-apps/basebuildpreview.mp4" />

### Step: Post to Publish
To publish your app, create a post in the Base app with your app's URL.

# Create a Mini App

> Quickly create a mini app, sign a manifest, and publish to the Base app.

**Prerequisites**

* Base app account
* [Vercel](https://vercel.com/) account for hosting the application

<Panel>

Video: https://www.youtube-nocookie.com/embed/vLnugincHAg?si=I_jyZxSzVe32nuC5

</Panel>


### Step: Deploy Template
Click the button below and follow the prompts to deploy the quickstart template to Vercel.


- [Deploy to Vercel](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fbase%2Fdemos%2Ftree%2Fmaster%2Fmini-apps%2Ftemplates%2Fminikit%2Fnew-mini-app-quickstart&project-name=new-mini-app-quickstart&repository-name=new-mini-app-quickstart&env=NEXT_PUBLIC_PROJECT_NAME&demo-title=New%20Mini%20App&demo-description=Quickstart%20waitlist%20mini%20app%20with%20MiniKit%20on%20Base)


### Step: Clone your repository
Clone the repo created by Vercel to make local edits.

Replace`<your-username>`with your github username.
#### Command```bash
 git clone https://github.com/<your-username>/new-mini-app-quickstart
 cd new-mini-app-quickstart
 npm install
```### Step: Update Manifest configuration
The`minikit.config.ts`file is responsible for configuring your manifest located at`app/.well-known/farcaster.json`and creating embed metadata.


> Note:
You can customize the manifest by updating the`miniapp`object.
For details on each field, see the [field reference](/mini-apps/features/manifest#field-reference).
#### Code```ts
 export const minikitConfig = {
 accountAssociation: { // this will be added in step 5
 "header": "",
 "payload": "",
 "signature": ""
 },
 miniapp: {
 version: "1",
 name: "Cubey",
 subtitle: "Your AI Ad Companion",
 description: "Ads",
 screenshotUrls: [`${ROOT_URL}/screenshot-portrait.png`],
 iconUrl: `${ROOT_URL}/blue-icon.png`,
 splashImageUrl: `${ROOT_URL}/blue-hero.png`,
 splashBackgroundColor: "#000000",
 homeUrl: ROOT_URL,
 webhookUrl: `${ROOT_URL}/api/webhook`,
 primaryCategory: "social",
 tags: ["marketing", "ads", "quickstart", "waitlist"],
 heroImageUrl: `${ROOT_URL}/blue-hero.png`,
 tagline: "",
 ogTitle: "",
 ogDescription: "",
 ogImageUrl: `${ROOT_URL}/blue-hero.png`,
 },
 } as const;
```### Step: Create accountAssociation Credentials
Now that you have a public domain for your application, you are ready to associate your mini app with your Farcaster account.

1. Ensure all changes are live by pushing changes to the`main`branch.

> Note:
Ensure that Vercel's **Deployment Protection** is off by going to the Vercel dashboard for your project and navigating to Settings -> Deployment Protection and toggling "Vercel Authentication" to off and click save.
2. Navigate to the Base Build [Account association tool](https://www.base.dev/preview?tab=account)

3. Paste your domain in the`App URL`field (ex: sample-url.vercel.app) and click "Submit"
4. Click on the "Verify" button that appears and follow the instructions to generate the`accountAssociation`fields.
5. Copy the`accountAssociation`object

### Step: Update`minikit.config.ts`Update your`minikit.config.ts`file to include the`accountAssociation`object you copied in the previous step.
#### Code```ts
 export const minikitConfig = {
 accountAssociation: {
 "header": "eyJmaBBiOjE3MzE4LCJ0eXBlIjoiY3VzdG9keSIsImtleSI6IjB4NzYwQjA0NDc5NjM4MTExNzNmRjg3YDPBYzA5OEJBQ0YxNzNCYkU0OCJ9",
 "payload": "eyJkb21haW4iOiJ4BWl0bGlzdC1xcy52ZXJjZWwuYXBwIn7",
 "signature":


### Step: Push updates to production
Push all changes to the `main`branch. Vercel will automatically deploy the changes to your production environment.

### Step: Preview Your App
Go to [base.dev/preview](https://base.dev/preview) to validate your app.

 1. Add your app URL to view the embeds and click the launch button to verify the app launches as expected.
 2. Use the "Account association" tab to verify the association credentials were created correctly.
 3. Use the "Metadata" tab to see the metadata added from the manifest and identify any missing fields.


### Step: Post to Publish
To publish your app, create a post in the Base app with your app's URL.

# Build Checklist

> Key steps to build a successful mini app

## Register for Base Build

Base Build unlocks Builder Rewards, boosts your chances of being featured, provides growth insights, and gives you a Preview tool to test and debug your app.


- [Register for Base Build](https://base.dev)


## Authentication

Authenticate when it unlocks value, not before. Fast, optional sign‑in keeps momentum and lets users act the moment onchain interactions are needed.


- [Authentication](/mini-apps/core-concepts/authentication)


## Manifest

Your manifest powers saving, discovery, and rich embeds. A strong manifest includes complete fields, valid assets, and`noindex: true`during testing.


- [Sign Your Manifest](/mini-apps/core-concepts/manifest)


## Embeds & Previews

Distribution starts in the feed: compelling previews with a clear image and launch button turn impressions into launches.


- [Embeds & Previews](/mini-apps/core-concepts/embeds-and-previews)


## Search & Discovery

Be found across surfaces: set a primary category, share once to trigger indexing, and keep assets valid to appear in search and categories.


- [Search & Discovery](/mini-apps/troubleshooting/how-search-works)


## Sharing & Social Graph

Design for social lift: native share flows and social navigation turn single‑player moments into threads and returns.


- [Sharing & Social Graph](/mini-apps/technical-guides/sharing-and-social-graph)


## Notifications

Re‑engage saved users with relevant, rate‑limited notifications at the right moments.


- [Notifications](/mini-apps/core-concepts/notifications)


## UX Best Practices

Build for compact, touch‑first contexts: respect safe areas, keep interfaces concise, and emphasize clear primary actions.



- [Design patterns](/mini-apps/featured-guidelines/design-guidelines)



- [OnchainKit](/mini-apps/featured-guidelines/product-guidelines/foundations)



## Build for Growth

Follow best practices to improve user engagement and retention.



- [Optimize Onboarding](/mini-apps/growth/optimize-onboarding)



- [Build Viral Mini Apps](/mini-apps/growth/build-viral-mini-apps)



# Building for The Base App

> People use apps to have fun, learn, earn, or connect. Your mini app should focus on **one core need** and do it exceptionally well.

The best apps are **simple, focused, and easy to understand.**


### Step: Ask yourself
* What’s the **one thing** my app does really well?

 * Why would someone **use it every day**?

 * Why and when would someone **share it with a friend**?

### Step: Audience fit
Base users are social, onchain-native, and interested in **creating, earning, trading, and connecting**.

### Step: Successful apps
* Help people **earn** (e.g. rewards, yield, creator income)

 * Help people **create** (e.g. minting, designing, storytelling)

 * Help people **have fun** (games, collectibles, quizzes, social experiences with onchain elements)

 * Are **simple,** **easy and satisfying** to use

 * Have **low friction onboarding** — avoid:

 * Collecting personal info (address, phone number, etc.)

 * Requiring upfront deposits or complex setup steps

### Step: Group chat focus
We’re especially excited about mini apps that make group chats more fun, functional, or rewarding — from games with onchain buy-ins, to tools like dinner-bill splitting with USDC.

### Featured Guidelines

When building mini apps for the Base app, follow the [Featured Guidelines](/mini-apps/featured-guidelines/overview):



- [Product Guidelines](/mini-apps/featured-guidelines/product-guidelines)



- [Design Guidelines](/mini-apps/featured-guidelines/design-guidelines)



- [Technical Guidelines](/mini-apps/featured-guidelines/technical-guidelines)



- [Notification Guidelines](/mini-apps/featured-guidelines/notification-guidelines)



# Manifest

> Define how your mini app appears and behaves within the Base app, enabling search, discovery, and rich embed features in the Base app.

<Panel>
#### JSON```json
 {
"accountAssociation": {
 "header": "eyJmaWQiOjkxNTIsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHgwMmVmNzkwRGQ3OTkzQTM1ZkQ4NDdDMDUzRURkQUU5NDBEMDU1NTk2In0",
 "payload": "eyJkb21haW4iOiJhcHAuZXhhbXBsZS5jb20ifQ",
 "signature": "MHgxMGQwZGU4ZGYwZDUwZTdmMGIxN2YxMTU2NDI1MjRmZTY0MTUyZGU4ZGU1MWU0MThiYjU4ZjVmZmQxYjRjNDBiNGVlZTRhNDcwNmVmNjhlMzQ0ZGQ5MDBkYmQyMmNlMmVlZGY5ZGQ0N2JlNWRmNzMwYzUxNjE4OWVjZDJjY2Y0MDFj"
},
"baseBuilder": {
 "ownerAddress": "0x..."
},
"miniapp": {
 "version": "1",
 "name": "Crypto Portfolio Tracker",
 "homeUrl": "https://ex.co
 "iconUrl": "https://ex.co/i.png
 "splashImageUrl": "https://ex.co/l.png
 "splashBackgroundColor": "#000000",
 "webhookUrl": "https://ex.co/api/webhook
 "subtitle": "Easy to manage",
 "description": "Track and manage your cryptocurrency portfolio.",
 "screenshotUrls": [
"https://ex.co/s1.png
"https://ex.co/s2.png
"https://ex.co/s3.png
 ],
 "primaryCategory": "finance",
 "tags": ["finance"],
 "heroImageUrl": "https://ex.co/og.png
 "tagline": "Save instantly",
 "ogTitle": "Example Mini App",
 "ogDescription": "Easy to manage portfolio.",
 "ogImageUrl": "https://ex.co/og.png
 "noindex": true
}
 }
```> Note:
Set`"noindex": true`for development or staging environments to prevent search indexing.

</Panel>

## Implementation

1. Create the manifest file in your project at`/public/.well-known/farcaster.json`. It needs to be accessible at `https://your-domain.com/.well-known/farcaster.json`2. Update the [required](#accountassociation) and [optional](#display-information) fields in the`miniapp`object
3. Ensure all changes are live so that the Manifest file is available at your app's url
4. Navigate to the Base Build [Account association tool](https://www.base.dev/preview?tab=account)
5. Paste your domain in the App URL field (ex: sample-url.vercel.app) and click "Submit"
6. Click on the "Verify" button that appears and sign the manifest with your wallet to generate the`accountAssociation`fields
7. Copy the generated`accountAssociation`fields (header, payload, and signature) and paste them into your manifest file, replacing the empty values in the`accountAssociation`object


> Warning:
Changes to the manifest take effect when you redeploy your Mini App and repost it. The platform re-indexes the updated configuration and applies changes to search, discovery, and embed rendering.

> Note:
Use the [Mini App Assets Generator](https://www.miniappassets.com/) to generate properly formatted icons, splash screens, and images that meet the requirements for both Base App and Farcaster mini apps.

## Schema

### accountAssociation

Proves domain ownership for your Mini App.


 <ParamField path="header" type="string" required>
 Encoded header for the association payload.
 </ParamField>

 <ParamField path="payload" type="string" required>
 Encoded payload containing your domain.
 </ParamField>

 <ParamField path="signature" type="string" required>
 Signature over the payload.
 </ParamField>


### baseBuilder

This verifies ownership and connects your Base Build account.This address should be the address of the wallet used when importing your mini app to Base Build.


 <ParamField path="ownerAddress" type="string" required>
 This verifies ownership and connects your Base Build account.
 </ParamField>


#### Identity & Launch

Defines your Mini App's core identity and the URL users land on when they open it.


 <ParamField path="version" type="string" required>
 Manifest version. Must be`"1"`.
 </ParamField>

 <ParamField path="name" type="string" required>
 Mini App name. Max 32 chars.
 </ParamField>

 <ParamField path="homeUrl" type="string" required>
 Default launch URL. HTTPS URL, max 1024 chars.
 </ParamField>

 <ParamField path="iconUrl" type="string" required>
 Icon image URL. HTTPS URL, PNG 1024×1024; transparent background discouraged.
 </ParamField>


#### Loading Experience

Controls the splash screen visuals and colors shown while your Mini App loads.


 <ParamField path="splashImageUrl" type="string" required>
 Loading image. HTTPS URL, recommended 200×200px.
 </ParamField>

 <ParamField path="splashBackgroundColor" type="string" required>
 Loading background color. Hex code (e.g., `#000000`).
 </ParamField>


#### Discovery & Search

Determines how your Mini App is indexed, categorized, and surfaced across Base App discovery features.


 <ParamField path="primaryCategory" type="string" required>
 Controls where your app appears in category browsing. One of: `games`, `social`, `finance`, `utility`, `productivity`, `health-fitness`, `news-media`, `music`, `shopping`, `education`, `developer-tools`, `entertainment`, `art-creativity`.
 </ParamField>

 <ParamField path="tags" type="string[]" required>
 Search/filter tags. Up to 5; ≤ 20 chars each; lowercase; no spaces/emojis/special chars.
 </ParamField>

 <ParamField path="noindex" type="boolean">
 Exclude from search results. `true`= exclude, default = include.
 </ParamField>


#### Display Information

Provides the descriptive text, screenshots, and promotional images shown on your Mini App's profile.


 <ParamField path="subtitle" type="string">
 Short description under name. Max 30 chars; avoid emojis/special chars.
 </ParamField>

 <ParamField path="description" type="string">
 Promo text for app page. Max 170 chars; avoid emojis/special chars.
 </ParamField>

 <ParamField path="tagline" type="string">
 Marketing tagline. Max 30 chars.
 </ParamField>

 <ParamField path="heroImageUrl" type="string">
 Large promo image. 1200×630px (1.91:1), PNG/JPG.
 </ParamField>

 <ParamField path="screenshotUrls" type="string[]">
 Visual previews. Max 3; portrait 1284×2778px recommended.
 </ParamField>


#### Notifications

Notification endpoint.


 <ParamField path="webhookUrl" type="string">
 POST events endpoint. HTTPS URL, max 1024 chars. Required if using notifications.
 </ParamField>


#### Embeds & Social Sharing

Configures how your Mini App appears when shared in feeds or on social platforms.


 <ParamField path="ogTitle" type="string">
 Open Graph title. Max 30 chars.
 </ParamField>

 <ParamField path="ogDescription" type="string">
 Open Graph description. Max 100 chars.
 </ParamField>

 <ParamField path="ogImageUrl" type="string">
 Open Graph image. 1200×630px (1.91:1), PNG/JPG.
 </ParamField>


## Related Concepts



- [Embeds and Previews](/mini-apps/core-concepts/embeds-and-previews)



# Mini App Context

> Improve user experience by instantly displaying user profile data and customizing user flows based on where your mini app was opened

When your app is opened as a mini app,`sdk.context`provides 4 data objects:

*`user`: User profile data
* `location`: Where the mini app was opened
* `client`: Host platform (e.g. the Base app or another Farcaster client) and device data
* `features`: Availability and state of features in the current client

<Panel>
#### Code
```ts
 export type MiniAppPlatformType = 'web' | 'mobile';

 export type MiniAppContext = {
user: {
 fid: number;
 username?: string;
 displayName?: string;
 pfpUrl?: string;
};
location?: MiniAppLocationContext;
client: {
 platformType?: MiniAppPlatformType;
 clientFid: number;
 added: boolean;
 safeAreaInsets?: SafeAreaInsets;
 notificationDetails?: MiniAppNotificationDetails;
};
features?: {
 haptics: boolean;
 cameraAndMicrophoneAccess?: boolean;
};
 };
```</Panel>

## Implementation

1. Install and import`@farcaster/miniapp-sdk`2. Check if opened as a mini app using`sdk.isInMiniApp;`3. If in a mini app, load the context object using`sdk.context`In the example below we detect if the app was opened as a mini app, and if so, we return the user's username, fid, display name, and profile image.
#### Code```typescript
"use client";
import { sdk } from "@farcaster/miniapp-sdk";
import { useEffect, useState } from "react";

export default function Profile {
 const [user, setUser] = useState(null);
 const [isInMiniApp, setIsInMiniApp] = useState(false);

 useEffect( => {
const loadUserData = async => {
 try {
// Check if we're in a Mini App
const miniAppStatus = await sdk.isInMiniApp;
setIsInMiniApp(miniAppStatus);

if (miniAppStatus) {
 // Get context and extract user info
 const context = await sdk.context;
 setUser(context.user);
}
 } catch (error) {
console.error("Error loading user data:", error);
 }
};

loadUserData;
 }, []);

 // Show message if not in Mini App
 if (!isInMiniApp) {
return (
 <div>
<p>Please open this app in a Farcaster or Base client to see your profile.</p>
 </div>
);
 }

 // Show user information
 if (user) {
return (
 <div>
<h2>Welcome, {user.displayName || user.username}!</h2>
<p>FID: {user.fid}</p>
<p>Username: @{user.username}</p>
{user.pfpUrl && (
 <img
src={user.pfpUrl}
alt="Profile"
width={64}
height={64}
style={{ borderRadius: '50%' }}
 />
)}
 </div>
);
 }

 return <div>Loading user profile...</div>;
}
```## Schema

### User Object

Contains the user's profile information. This data shouldn't be used for authentication or sensitive actions because its passed by the application.


 <ParamField path="fid" type="number" required>
 Unique Farcaster identifier for the user.
 </ParamField>

 <ParamField path="username" type="string">
 Handle without @ symbol.
 </ParamField>

 <ParamField path="displayName" type="string">
 User's chosen display name.
 </ParamField>

 <ParamField path="pfpUrl" type="string">
 Profile picture URL.
 </ParamField>

 <ParamField path="bio" type="string">
 User's biography text.
 </ParamField>

 <ParamField path="location" type="object">
 User's location information.
 </ParamField>

 <ParamField path="location.placeId" type="string">
 Google Places ID.
 </ParamField>

 <ParamField path="location.description" type="string">
 Human-readable location description.
 </ParamField>

#### JSON```json
{
 "fid": 6841,
 "username": "deodad",
 "displayName": "Tony D'Addeo",
 "pfpUrl": "https://i.imgur.com/dMoIan7.jpg
 "bio": "Building @warpcast and @farcaster",
 "location": {
"placeId": "ChIJLwPMoJm1RIYRetVp1EtGm10",
"description": "Austin, TX, USA"
 }
}
````

### Location Object

Contains information about the context from which the Mini App was launched. This helps you understand how users discovered and accessed your app.

**Location Types:**

- **`cast_embed`**: Launched from a cast where your app is embedded
- **`cast_share`**: Launched when a user shared a cast to your app
- **`notification`**: Launched from a notification triggered by your app
- **`launcher`**: Launched directly from the client app catalog
- **`channel`**: Launched from within a specific Farcaster channel
- **`open_miniapp`**: Launched from another Mini App

#### CastEmbedLocationContext

 <ParamField path="type" type="'cast_embed'" required>
 Indicates the Mini App was launched from a cast where it is an embed.
 </ParamField>

 <ParamField path="embed" type="string" required>
 The embed URL.
 </ParamField>

 <ParamField path="cast" type="MiniAppCast" required>
 Cast information containing the embed.
 </ParamField>

#### JSON

````json
{
 "type": "cast_embed",
 "embed": "https://myapp.example.com
 "cast": {
"author": {
 "fid": 3621,
 "username": "alice",
 "displayName": "Alice",
 "pfpUrl": "https://example.com/alice.jpg
},
"hash": "0xa2fbef8c8e4d00d8f84ff45f9763b8bae2c5c544",
"timestamp": 1749160866000,
"text": "Check out this awesome mini app!",
"embeds": ["https://myapp.example.com
"channelKey": "farcaster"
 }
}
```#### CastShareLocationContext


 <ParamField path="type" type="'cast_share'" required>
 Indicates the Mini App was launched when a user shared a cast to your app.
 </ParamField>

 <ParamField path="cast" type="MiniAppCast" required>
 The cast that was shared to your app.
 </ParamField>


#### NotificationLocationContext


 <ParamField path="type" type="'notification'" required>
 Indicates the Mini App was launched from a notification.
 </ParamField>

 <ParamField path="notification" type="object" required>
 Notification details.

 <ParamField path="notification.notificationId" type="string" required>
 Unique notification identifier.
 </ParamField>

 <ParamField path="notification.title" type="string" required>
 Notification title.
 </ParamField>

 <ParamField path="notification.body" type="string" required>
 Notification body text.
 </ParamField>
 </ParamField>

#### JSON```json
{
 "type": "notification",
 "notification": {
"notificationId": "f7e9ebaf-92f0-43b9-a410-ad8c24f3333b",
"title": "Yoinked!",
"body": "horsefacts captured the flag from you."
 }
}
```#### LauncherLocationContext


 <ParamField path="type" type="'launcher'" required>
 Indicates the Mini App was launched directly by the client app outside of a context.
 </ParamField>


#### ChannelLocationContext


 <ParamField path="type" type="'channel'" required>
 Indicates the Mini App was launched from within a specific Farcaster channel.
 </ParamField>

 <ParamField path="channel" type="object" required>
 Channel details.
 </ParamField>

 <ParamField path="channel.key" type="string" required>
 Channel key identifier.
 </ParamField>

 <ParamField path="channel.name" type="string" required>
 Channel name.
 </ParamField>

 <ParamField path="channel.imageUrl" type="string">
 Channel profile image URL.
 </ParamField>


#### OpenMiniAppLocationContext


 <ParamField path="type" type="'open_miniapp'" required>
 Indicates the Mini App was launched from another Mini App.
 </ParamField>

 <ParamField path="referrerDomain" type="string" required>
 The domain of the Mini App that opened the current app.
 </ParamField>


### Client Object

Contains details about the Farcaster client running your Mini App. This data should be considered untrusted.

#### ClientContext


 <ParamField path="platformType" type="'web' | 'mobile'">
 Platform where the app is running.
 </ParamField>

 <ParamField path="clientFid" type="number" required>
 Self-reported FID of the client (e.g., 9152 for Farcaster).
 </ParamField>

 <ParamField path="added" type="boolean" required>
 Whether the user has added your Mini App to their client.
 </ParamField>

 <ParamField path="safeAreaInsets" type="object">
 Screen insets to avoid navigation elements that obscure the view.

 <Expandable title="properties">
 <ParamField path="top" type="number" required>
 Top safe area inset in pixels.
 </ParamField>

 <ParamField path="bottom" type="number" required>
 Bottom safe area inset in pixels.
 </ParamField>

 <ParamField path="left" type="number" required>
 Left safe area inset in pixels.
 </ParamField>

 <ParamField path="right" type="number" required>
 Right safe area inset in pixels.
 </ParamField>
 </Expandable>
 </ParamField>

 <ParamField path="notificationDetails" type="object">
 Notification configuration if enabled.

 <Expandable title="properties">
 <ParamField path="url" type="string" required>
 Endpoint for sending notifications.
 </ParamField>

 <ParamField path="token" type="string" required>
 Authentication token for notifications.
 </ParamField>
 </Expandable>
 </ParamField>

#### JSON```json
{
 "platformType": "mobile",
 "clientFid": 9152,
 "added": true,
 "safeAreaInsets": {
"top": 0,
"bottom": 20,
"left": 0,
"right": 0
 },
 "notificationDetails": {
"url": "https://docs.neynar.com/reference/publish-frame-notifications
"token": "a05059ef2415c67b08ecceb539201cbc6"
 }
}
```### Features Object

Indicates which platform features are available and their current state in the client.


 <ParamField path="haptics" type="boolean" required>
 Whether haptic feedback is supported on the current platform.
 </ParamField>

 <ParamField path="cameraAndMicrophoneAccess" type="boolean">
 Whether camera and microphone permissions have been granted and stored for this mini app.
 </ParamField>

#### JSON```json
{
 "haptics": true,
 "cameraAndMicrophoneAccess": true
}
```<Note>For more detailed capability detection, use the`sdk.getCapabilities`method which returns specific SDK methods supported by the host.</Note>

# Embeds & Previews

> Mini apps use metadata to create embeds when users share links. The embed shows a preview image and launch button.

<Panel>
 <Frame caption="Mini App embed in social feed">
 ![](https://mintcdn.com/base-a060aa97/gS084HRa38b8UMsN/images/minikit/feed_mini.jpg?fit=max&auto=format&n=gS084HRa38b8UMsN&q=85&s=0bff73fdce8aef932cb9245a833eb506)
 </Panel>

## Implementation

Add this meta tag to the`<head>`section of any page you want to make shareable:

<CodeGroup>
#### Code```html
 <!DOCTYPE html>
 <html lang="en">
<head>
 <title>My Mini App</title>
 <meta
name="fc:miniapp"
content='{
 "version": "next",
 "imageUrl": "https://example.com/preview.png
 "button": {
"title": "Open App",
"action": {
 "type": "launch_frame",
 "url": "https://example.com
}
 }
}'
 />
</head>
<body>
 <!-- Your app content -->
</body>
 </html>
```#### Code```jsx
 // app/layout.tsx or app/page.tsx (Next.js App Router)
 import type { Metadata } from "next";

 export async function generateMetadata: Promise<Metadata> {
 return {
title: miniapp.name,
description: miniapp.description,
other: {
 "fc:miniapp": JSON.stringify({
version: miniapp.version,
imageUrl: miniapp.heroImageUrl,
button: {
 title: `Join the ${miniapp.name}`,
 action: {
name: `Launch ${miniapp.name}`,
url: `${miniapp.homeUrl}`},
},
 }),
},
 };
 }

 export default function RootLayout({ children }: { children: React.ReactNode }) {
return (
 <html lang="en">
<body>{children}</body>
 </html>
);
 }```</CodeGroup>


> Note:
The`homeUrl`used in the`manifest`*must* have embed metadata defined, in order for the mini app to render correctly in the Base app.
## Schema


 <ParamField path="version" type="string" required>
 Version of the embed. Must be`"1"`or`"next"`.
 </ParamField>

 <ParamField path="imageUrl" type="string" required>
 Image URL for the embed. Must be 3:2 aspect ratio, maximum 10MB, maximum 1024 characters.
 </ParamField>

 <ParamField path="button" type="object" required>
 Button configuration object.
 </ParamField>


### Button Configuration

Defines the launch button that appears on the embed.


 <ParamField path="button.title" type="string" required>
 Button text. Maximum 32 characters.
 </ParamField>

 <ParamField path="button.action" type="object" required>
 Action configuration object. Maximum 1024 characters.
 </ParamField>


### Action Configuration

Specifies what happens when the embed button is clicked.


 <ParamField path="button.action.type" type="string" required>
 Action type. Must be `"launch_frame"`.
 </ParamField>

 <ParamField path="button.action.url" type="string">
 App URL to open. Defaults to the full URL of the page including query parameters. Maximum 1024 characters.
 </ParamField>

 <ParamField path="button.action.name" type="string">
 Application name. Maximum 32 characters. Defaults to manifest name.
 </ParamField>

 <ParamField path="button.action.splashImageUrl" type="string">
 Splash screen image URL. Must be 200x200 pixels. Maximum 32 characters. Defaults to manifest splash image.
 </ParamField>

 <ParamField path="button.action.splashBackgroundColor" type="string">
 Splash screen background color. Must be hex color code. Defaults to manifest splash background color.
 </ParamField>


## Related Concepts



- [Search and Discovery](/mini-apps/technical-guides/search-and-discovery)



- [Sharing and Social Graph](/mini-apps/technical-guides/sharing-and-social-graph)



# Base Account

> Learn how Base Accounts enhance Mini App user experience and what Mini App developers need to know to implement Base Account capabilities.

> **What you'll learn**\
> By the end of this guide, you'll understand:
>
> * How to handle wallet transactions effectively in Mini Apps, including leveraging enhanced Base Account capabilities when available.

## Default Wallets in Mini Apps

Mini Apps launched within the Base App are automatically connected to the user's [Base Account](/base-account/overview), eliminating wallet connection flows and enabling instant onchain interactions. This zero-friction approach means users can immediately swap, send, and transact without any wallet setup, maintaining a familiar experience with their existing Base Account and assets.

## For Mini App Development


### Step: Detect Base Account Capabilities
Base Accounts offer enhanced features that traditional wallets don't support.

 * Use `wallet_getCapabilities`to check for`atomicBatch`, `paymasterService`, and `auxiliaryFunds`* Adapt your UI to show streamlined workflows for Base Account users
 * Provide fallback experiences for traditional wallets

 <Check>
 Test with both Base Accounts and traditional wallets to ensure your capability detection works correctly.
 </Check>

 Learn More: [Base Account Capabilities Overview](/base-account/reference/core/capabilities/overview)

### Step: Implement Sponsored Gas Transactions
Enable sponsored gas transactions where your Mini App pays gas fees for users.

 * Check for`paymasterService`capability before offering gas-free transactions
 * Use the`capabilities`parameter in`writeContracts`to enable sponsored gas
 * Handle cases where paymaster service is unavailable

 <Check>
 Verify your Mini App works with Base Accounts that have zero ETH balance.
 </Check>

 Learn More: [Paymaster Service](/base-account/reference/core/capabilities/paymasterService)

### Step: Optimize Transaction Patterns
Base Accounts can batch multiple operations into single transactions.

 * Use`atomicBatch`capability to group related transactions
 * Implement`wallet_sendCalls`for complex workflows
 * Show one confirmation instead of multiple prompts


> Note:
Consider transaction batching for multi-step operations like approve + transfer + mint.

Learn More: [Batch Transactions Guide](/base-account/improve-ux/batch-transactions)

## Base Account Benefits for Mini Apps

| Feature | What It Does | Mini App Benefit |
| ---------------------- | ---------------------------------------------- | ------------------------------------------------------- |
| Atomic Batch | Combines multiple transactions into one | Multi-step workflows require only one user confirmation |
| Paymaster Service | App pays gas fees, not user | Users can transact without owning ETH |
| Passkey Authentication | Uses device biometrics instead of private keys | Faster, more secure user authentication |

## Implementation Examples

### Capability Detection```javascript
function useBaseAccountCapabilities(address) {
 const [capabilities, setCapabilities] = useState({});

 useEffect( => {
async function detect {
 const caps = await publicClient.request({
method: 'wallet_getCapabilities',
params: [address]
 });

 setCapabilities({
atomicBatch: caps['0x2105']?.atomicBatch?.supported,
paymasterService: caps['0x2105']?.paymasterService?.supported,
auxiliaryFunds: caps['0x2105']?.auxiliaryFunds?.supported
 });
}

if (address) detect;
 }, [address]);

 return capabilities;
}
```### Sponsored Gas Implementation```javascript
import { useCapabilities, useWriteContracts } from 'wagmi/experimental'

function SponsoredTransactionButton {
 const account = useAccount
 const { writeContracts } = useWriteContracts
 const { data: availableCapabilities } = useCapabilities({
account: account.address,
 })

 const capabilities = useMemo( => {
if (!availableCapabilities || !account.chainId) return {}
const capabilitiesForChain = availableCapabilities[account.chainId]
if (
 capabilitiesForChain['paymasterService'] &&
 capabilitiesForChain['paymasterService'].supported
) {
 return {
paymasterService: {
 url: `https://api.developer.coinbase.com/rpc/v1/base/v7HqDLjJY4e28qgIDAAN4JNYXnz88mJZ`},
 }
}
return {}
 }, [availableCapabilities, account.chainId])

 const handleSponsoredMint = => {
writeContracts({
 contracts: [{
address: '0x...',
abi: contractAbi,
functionName: 'mint',
args: [account.address],
 }],
 capabilities,
})
 }

 return <button onClick={handleSponsoredMint}>Mint NFT (Gas Free)</button>
}```### Capability-Based UI```javascript
function MiniAppWorkflow {
 const { address } = useAccount;
 const { atomicBatch } = useBaseAccountCapabilities(address);

 if (atomicBatch) {
// Base Account: One-click workflow
return <OneClickPurchaseFlow />;
 } else {
// Traditional wallet: Multi-step workflow
return <MultiStepPurchaseFlow />;
 }
}
```## Additional Resources

For detailed implementation of Base Account features:



- [User Authentication](https://docs.base.org/base-account/guides/authenticate-users)



- [Base Pay Guide](https://docs.base.org/base-account/guides/accept-payments)



- [Sign and Verify Signatures](https://docs.base.org/base-account/guides/sign-and-verify-typed-data)



# Notifications

> Regularly re-engage users by sending in-app notifications through the Base app

## Overview

When a user enables notifications for your Mini App, the Base app generates a unique notification`token`and`url`which is sent to your server via webhook.

This`token`grants your app permission to send in-app notifications to that specific user.

To send a notification, make a`POST`request to the`url`with the user's notification`token`and your content.

You will receive webhook events when users enable or disable notifications for your app. When disabled, the notification token becomes invalid and should no longer be used.

## Client App Behavior

Different client apps handle webhook responses differently:

**Farcaster app**: Activates notification tokens immediately without waiting for a webhook success response.

**Base app**: Waits for a successful webhook response before activating tokens.

<Note>
 If your webhook processes token saving and sends notifications synchronously before returning a response, tokens may work on Farcaster but fail to activate on Base app.
</Note>

<Panel>
 ![](https://mintcdn.com/base-a060aa97/uEmvHrTbmfeJo9n_/images/minikit/notifications-sample.png?fit=max&auto=format&n=uEmvHrTbmfeJo9n_&q=85&s=52a08c64b48c40d8118d2b32ee4ba3c9)

 <Info>
 Notification tokens are unique to each client app. This means a user can have separate notification preferences for your Mini App across different clients (e.g., Farcaster, the Base app). Removing your Mini App in one client does not affect its status in other clients.
 </Info>
</Panel>

## Implementation


### Step: Install @farcaster/miniapp-node
Install the`@farcaster/miniapp-node`package in your project:
#### Command```bash
 npm install @farcaster/miniapp-node
```Get a free API key from [neynar](https://dev.neynar.com/) and set`NEYNAR_API_KEY`in your environment variables.

### Step: Create a webhook server
Create a webhook server to handle webhook events.

 <Info>
 Use`parseWebhookEvent`with`verifyAppKeyWithNeynar`to verify the client signature and authenticate events signed by the app key.

 The`data`object returned by`parseWebhookEvent` contains three key fields:

 * **`fid`**: The user's FID
 * **`appFid`**: The client's FID (the Base app is 309857)
 * **`event`**: The event payload with type and notification details

 Always use both `fid`and`appFid`together to identify a unique user-client combination.
 </Info>
#### Code```ts

import {
 parseWebhookEvent,
 verifyAppKeyWithNeynar,
} from "@farcaster/miniapp-node";

export async function POST(request: NextRequest) {
 const requestJson = await request.json;

 // Parse and verify the webhook event
 let data;
 try {
data = await parseWebhookEvent(requestJson, verifyAppKeyWithNeynar);
// Events are signed by the app key of a user with a JSON Farcaster Signature.
 } catch (e: unknown) {
// Handle verification errors (invalid data, invalid app key, etc.)
// Return appropriate error responses with status codes 400, 401, or 500
 }


 // Extract webhook data

 const fid = data.fid;
 const appFid = data.appFid; // The FID of the client app that the user added the Mini App to
 const event = data.event;

// Handle different event types

try {
 switch (event.event) {
case "miniapp_added":
 if (event.notificationDetails) {
 setUserNotificationDetails(fid, appFid, event.notificationDetails);
 sendMiniAppNotification(fid, appFid, "Welcome to Base Mini Apps", "Mini app is now added to your client");
 fid,
 appFid,
 title: "Welcome to Base Mini Apps",
 body: "Mini app is now added to your client",
});
 }
 break;

case "miniapp_removed":
 // Delete notification details
 await deleteUserNotificationDetails(fid, appFid);
 break;

case "notifications_enabled":
 // Save new notification details and send confirmation
 setUserNotificationDetails(fid, appFid, event.notificationDetails);
 sendMiniAppNotification({
fid,
appFid,
title: "Ding ding ding",
body: "Notifications are now enabled",
 });
 break;

case "notifications_disabled":
 // Delete notification details
 await deleteUserNotificationDetails(fid, appFid);
 break;
 }
} catch (error) {
 console.error("Error processing webhook:", error);
}

return response;
```### Step: Add the Webhook URL to your manifest
Add the Webhook URL to your manifest file
#### JSON```json
{
 "accountAssociation": {
"header": "eyJmaWQiOjU0NDgsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHg2MWQwMEFENzYwNjhGOEQ0NzQwYzM1OEM4QzAzYUFFYjUxMGI1OTBEIn0",
"payload": "eyJkb21haW4iOiJleGFtcGxlLmNvbSJ9",
"signature": "MHg3NmRkOWVlMjE4OGEyMjliNzExZjUzOTkxYTc1NmEzMGZjNTA3NmE5OTU5OWJmOWFmYjYyMzAyZWQxMWQ2MWFmNTExYzlhYWVjNjQ3OWMzODcyMTI5MzA2YmJhYjdhMTE0MmRhMjA4MmNjNTM5MTJiY2MyMDRhMWFjZTY2NjE5OTFj"
 },
 "miniapp": {
"version": "1",
"name": "Example App",
"iconUrl": "https://example.com/icon.png
"homeUrl": "https://example.com
"imageUrl": "https://example.com/image.png
"buttonTitle": "Check this out",
"splashImageUrl": "https://example.com/splash.png
"splashBackgroundColor": "#eeccff",
"webhookUrl": "https://example.com/api/webhook
 }
}
```### Step: Prompt users to add your Mini App
Use the`addMiniApp`hook to prompt users to add your Mini App


> Warning:
**Important: Webhook Response Timing**
 Webhooks must respond within 10 seconds to avoid timeouts from the Base app. If you encounter a "Failed to add mini app" error, your webhook may be taking too long to respond.
#### Code```tsx
"use client";

import { sdk } from "@farcaster/miniapp-sdk";
import { useCallback, useState } from "react";

export default function AddMiniApp {
 const [result, setResult] = useState("");

 const handleAddMiniApp = useCallback(async => {
try {
 const response = await sdk.actions.addMiniApp;

 if (response.notificationDetails) {
setResult("Mini App added with notifications enabled!");
 } else {
setResult("Mini App added without notifications");
 }
} catch (error) {
 setResult(`Error: ${error}`);
}
 }, []);

 return (
<div>
 <button onClick={handleAddMiniApp}>
Add Mini App
 </button>
 {result && <p>{result}</p>}
</div>
 );
}
```### Step: Save the token and URL from the webhook event
The`token`and`url`need to be securely saved to a database so they can be looked up when you want to send a notification to a particular user.
#### JSON```json
{
 "event": "notifications_enabled",
 "notificationDetails": {
"url": "https://docs.neynar.com/reference/publish-frame-notifications
"token": "a05059ef2415c67b08ecceb539201cbc6"
 }
}
```### Step: Send notifications
Send notifications by sending a`POST`request to the`url`associated with the user's`token`#### Code```ts
export async function sendMiniAppNotification({
 fid,
 appFid,
 title,
 body,
}: {
 fid: number;
 appFid: number;
 title: string;
 body: string;
}): Promise<sendMiniAppNotificationResult> {
 const notificationDetails = await getUserNotificationDetails(fid, appFid);
 if (!notificationDetails) {
return { state: "no_token" };
 }

 const response = await fetch(notificationDetails.url, {
method: "POST",
headers: {
 "Content-Type": "application/json",
},
body: JSON.stringify({
 notificationId: crypto.randomUUID,
 title,
 body,
 targetUrl: appUrl,
 tokens: [notificationDetails.token],
} satisfies SendNotificationRequest),
 });

 const responseJson = await response.json;

 if (response.status === 200) {
const responseBody = sendNotificationResponseSchema.safeParse(responseJson);
if (responseBody.success === false) {
 // Malformed response
 return { state: "error", error: responseBody.error.errors };
}

if (responseBody.data.result.rateLimitedTokens.length) {
 // Rate limited
 return { state: "rate_limit" };
}

return { state: "success" };
 } else {
// Error response
return { state: "error", error: responseJson };
 }
}
````

## Schema

### Send Notification Request Schema

 <ParamField path="notificationId" type="string" required>
 Identifier that is combined with the FID to form an idempotency key. When the user opens the Mini App from the notification this ID will be included in the context object. **Maximum length of 128 characters.**
 </ParamField>

 <ParamField path="title" type="string" required>
 Title of the notification. **Max length 32 characters.**
 </ParamField>

 <ParamField path="body" type="string" required>
 Body of the notification. **Max length 128 characters.**
 </ParamField>

 <ParamField path="targetUrl" type="string" required>
 URL to open when the user clicks the notification. **Max length 1024 characters.**
 <Note>Must be on the same domain as the Mini App.</Note>
 </ParamField>

 <ParamField path="tokens" type="string[]" required>
 Array of notification tokens to send to. **Max 100 tokens.**
 </ParamField>

### Send Notification Response Schema

 <ParamField path="successfulTokens" type="string[]" required>
 Tokens for which the notification succeeded.
 </ParamField>

 <ParamField path="invalidTokens" type="string[]" required>
 Tokens which are no longer valid and should never be used again. This could happen if the user disabled notifications but for some reason the Mini App server has no record of it.
 </ParamField>

 <ParamField path="rateLimitedTokens" type="string[]" required>
 Tokens for which the rate limit was exceeded. The Mini App server can try later.
 </ParamField>

## Events

Mini App events use the following object structure:

- **`type`**: notification event type
- **`notificationDetails.url`**: URL that the app should call to send a notification.
- **`notificationDetails.token`**: A secret token generated by the Base app and shared with the Notification Server. A token is unique for each (Farcaster Client, Mini App, user Fid) tuple.

<Note>If users are not seeing the option to enable notifications when they call `addMiniApp`, verify that your manifest file contains a valid `webhookUrl`.</Note>

### `miniapp_added`Sent when the user adds the Mini App to their Farcaster client (whether or not it was triggered by an`addMiniApp`prompt).

#### JSON```json

{
"event": "miniapp_added",
"notificationDetails": {
"url": "https://docs.neynar.com/reference/publish-frame-notifications
"token": "a05059ef2415c67b08ecceb539201cbc6"
}
}
```###`miniapp_removed`Sent when a user removes the Mini App, which means that any notification tokens for that FID and client app (based on signer requester) should be considered invalid:

#### JSON```json

{
"event": "miniapp_removed"
}
```###`notifications_enabled`Sent when a user enables notifications (e.g. after disabling them). The payload includes a new`token`and`url`:

#### JSON

````json
{
 "event": "notifications_enabled",
 "notificationDetails": {
"url": "https://docs.neynar.com/reference/publish-frame-notifications
"token": "a05059ef2415c67b08ecceb539201cbc6"
 }
}
```###`notifications_disabled`Sent when a user disables notifications from, e.g., a settings panel in the client app. Any notification tokens for that FID and client app (based on signer requester) should be considered invalid:
#### JSON```json
{
 "event": "notifications_disabled"
}
```# Authentication

> Quick Auth provides instant authentication by leveraging Farcaster's identity system - no passwords, email verification, or complex OAuth flows required.

When Quick Auth is called:

* The user authenticates with a signature
* The SDK returns a JWT that your backend verifies to confirm the user's identity
* The backend returns trusted data that can be used for sensitive actions


> Note:
This differs from the [Context API](/mini-apps/core-concepts/context), which provides instant access to user information without authentication but cannot be trusted for sensitive operations.

## Implementation

### Step 1: Frontend Authentication

This code authenticates the user with Quick Auth, stores the JWT in memory, and uses it to verify the user's identity with your backend.
#### Code```jsx
import { useState } from "react";
import { sdk } from "@farcaster/miniapp-sdk";

export function App {
 const [token, setToken] = useState<string | null>(null);
 const [userData, setUserData] = useState<{ fid: number} | null>(null);

 async function signIn {
 try {
 const { token } = await sdk.quickAuth.getToken;
 setToken(token);

 // Use the token to authenticate the user and fetch authenticated user data
 const response = await sdk.quickAuth.fetch(`${BACKEND_ORIGIN}/auth`, {
 headers: { "Authorization": `Bearer ${token}`}
 });

 const data = await response.json;
 setUserData(data);
 } catch (error) {
 console.error("Authentication failed:", error);
 }
 }

 function signOut {
 setToken(null);
 setUserData(null);
 }

 if (!token) {
 return <button onClick={signIn}>Sign In</button>;
 }

 return (
 <div>
 <p>Authenticated as FID: {userData?.fid}</p>
 <button onClick={signOut}>Sign Out</button>
 </div>
 );
}```### Step 2: Backend Verification

Install the Quick Auth client:
#### Command```bash
npm install @farcaster/quick-auth
```**Quick Auth Client** is the SDK that initiates the authentication flow in your application.

**Quick Auth Server** is Farcaster's service that handles signature verification and issues JWTs.

When a user authenticates, the Quick Auth Server verifies their signature and issues a JWT. Your backend verifies this JWT using the`@farcaster/quick-auth`package.
#### Code```jsx
// app/api/auth/route.ts
import { createClient, Errors } from '@farcaster/quick-auth';
import { NextRequest, NextResponse } from 'next/server';

const domain = 'your-domain.com'; // Must match your mini app's deployment domain
const client = createClient;

// This endpoint returns the authenticated user's FID
export async function GET(request: NextRequest) {
 const authorization = request.headers.get('Authorization');
 if (!authorization?.startsWith('Bearer ')) {
return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 }

 const token = authorization.split(' ')[1];

 try {
const payload = await client.verifyJwt({ token, domain });

return NextResponse.json({
 fid: payload.sub,
});
 } catch (e) {
if (e instanceof Errors.InvalidTokenError) {
 return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
}
throw e;
 }
}
```## Schema

### JWT Payload
#### JSON```json
{
 "iat": 1747764819,
 "iss": "https://auth.farcaster.xyz
 "exp": 1747768419,
 "sub": 6841,
 "aud": "your-domain.com"
}
````

Payload fields:

 <ParamField path="iat" type="number">
 Issued at timestamp
 </ParamField>

 <ParamField path="iss" type="string">
 Quick Auth Server that issued the JWT
 </ParamField>

 <ParamField path="exp" type="number">
 Expiration timestamp (1 hour from issuance)
 </ParamField>

 <ParamField path="sub" type="number">
 User's Farcaster ID (FID)
 </ParamField>

 <ParamField path="aud" type="string">
 Your mini app's domain
 </ParamField>

- [useAuthenticate](/onchainkit/latest/components/minikit/hooks/useAuthenticate)

- [Context](/mini-apps/core-concepts/context)

# Sign Your Manifest

> Learn what a Mini App manifest is, why signing it matters, and how to generate and add an account association to your app.

Every Mini App needs a **manifest** (`farcaster.json`) file to be recognized by Farcaster clients. It declares your app’s details and domain, and when signed, produces an **Account Association** that proves your Farcaster account owns and can publish the app. Without it, your app won’t work as a Mini App.

### Prerequisites

- A deployed App, accessible via HTTPS
- A Base app account

## Location

Your manifest file must be publicly accessible at:\
`https://your-domain.com/.well-known/farcaster.json`> Note:
Want to learn more about manifests? 👉 Check out our [Manifest guide](/mini-apps/features/manifest).

## Sign Your Manifest

There are two supported ways to sign and generate your manifest:

<Tabs>
 <Tab title="Base Build" icon="star">
 ## Option 1: Base Build Preview Tool

1.  Visit [base.org](https://base.org) and sign in with your Base account.
2.  Open **Preview → Account Association**.
3.  Enter your Mini App domain in the App URL field.
4.  Click **Submit**. You should see a notification that you should verify your app ownership. Click **Verify → Sign**.
5.  Follow the on-screen instructions to sign the message in your wallet.
6.  Click **Copy** to copy the generated`accountAssociation`object.
7.  Paste it into your project’s`farcaster.json`under`accountAssociation`.
8.  Redeploy your application to production.

You should now see three green check marks indicating successful signing.

 <Tab title="Farcaster">
 ## Option 2: Farcaster Manifest Tool

1.  Go to [farcaster.xyz](https://farcaster.xyz) and log in.
2.  Navigate to **Developers → Manifest Tool**.
3.  Enter your domain (exclude `https://`and trailing slashes).
4.  Click **Refresh** to fetch your app.
5.  Select **Generate Account Association**.
6.  Copy the generated object.
7.  Paste it into your project’s`farcaster.json`under`accountAssociation`.
8.  Redeploy your application to production.

You should now see green check marks indicating successful signing.

## Example Manifest

Here’s a simplified example of what a `farcaster.json`could look like from the [Base Camp Mini App](https://basecamp25.app/.well-known/farcaster.json)

#### JSON```json

{
"accountAssociation": {
"header": "<generated-header>",
"payload": "<generated-payload>",
"signature": "<generated-signature>"
},
"miniapp": {
"version": "1",
"name": "Basecamp 2025", // App name
"description": "Access and manage your experience @ Basecamp",
"iconUrl": "https://basecamp25.app/icon.png // App icon
"homeUrl": "https://basecamp25.app // Landing page
"canonicalDomain": "basecamp25.app", // Must match your domain
"requiredChains": ["eip155:8453"], // Chains your app supports
"tags": ["basecamp", "miniapp"], // Optional tags
"requiredCapabilities": [ // Capabilities your app needs
"actions.ready",
"actions.signIn"
]
}
}

````




#### Ek Varyant 2



> Learn what a Mini App manifest is, why signing it matters, and how to generate and add an account association to your app.

Every Mini App needs a **manifest** (`farcaster.json`) file to be recognized by Farcaster clients. It declares your app’s details and domain, and when signed, produces an **Account Association** that proves your Farcaster account owns and can publish the app. Without it, your app won’t work as a Mini App.

### Prerequisites

* A deployed App, accessible via HTTPS
* A Base app account

## Location

Your manifest file must be publicly accessible at:\
`https://your-domain.com/.well-known/farcaster.json`> Note:
Want to learn more about manifests? 👉 Check out our [Manifest guide](/mini-apps/features/manifest).
## Sign Your Manifest

There are two supported ways to sign and generate your manifest:

<Tabs>
 <Tab title="Base Build" icon="star">
 ## Option 1: Base Build Preview Tool

 1. Visit **[Base.dev](https://base.dev* and sign in with your Base account.
 2. Open **Preview → Account Association**.
 3. Enter your Mini App domain in the App URL field.
 4. Click **Submit**. You should see a notification that you should verify your app ownership. Click **Verify → Sign**.
 5. Follow the on-screen instructions to sign the message in your wallet.
 6. Click **Copy** to copy the generated`accountAssociation`object.
 7. Paste it into your project’s`farcaster.json`under`accountAssociation`.
 8. Redeploy your application to production.

 You should now see three green check marks indicating successful signing.



 <Tab title="Farcaster">
 ## Option 2: Farcaster Manifest Tool

 1. Go to **[farcaster.xyz](https://farcaster.xyz* and log in.
 2. Navigate to **Developers → Manifest Tool**.
 3. Enter your domain (exclude `https://`and trailing slashes).
 4. Click **Refresh** to fetch your app.
 5. Select **Generate Account Association**.
 6. Copy the generated object.
 7. Paste it into your project’s`farcaster.json`under`accountAssociation`.
 8. Redeploy your application to production.

 You should now see green check marks indicating successful signing.


## Example Manifest

Here’s a simplified example of what a `farcaster.json`could look like from the [Base Camp Mini App](https://basecamp25.app/.well-known/farcaster.json)
#### JSON```json
{
 "accountAssociation": {
"header": "<generated-header>",
"payload": "<generated-payload>",
"signature": "<generated-signature>"
 },
 "miniapp": {
"version": "1",
"name": "Basecamp 2025", // App name
"description": "Access and manage your experience @ Basecamp",
"iconUrl": "https://basecamp25.app/icon.png // App icon
"homeUrl": "https://basecamp25.app // Landing page
"canonicalDomain": "basecamp25.app", // Must match your domain
"requiredChains": ["eip155:8453"], // Chains your app supports
"tags": ["basecamp", "miniapp"], // Optional tags
"requiredCapabilities": [ // Capabilities your app needs
 "actions.ready",
 "actions.signIn"
]
 }
}
````

#### Ek Varyant 3

> Learn what a Mini App manifest is, why signing it matters, and how to generate and add an account association to your app.

Every Mini App needs a **manifest** (`farcaster.json`) file to be recognized by Farcaster clients. It declares your app’s details and domain, and when signed, produces an **Account Association** that proves your Farcaster account owns and can publish the app. Without it, your app won’t work as a Mini App.

### Prerequisites

- A deployed App, accessible via HTTPS
- A Base app account

## Location

Your manifest file must be publicly accessible at:\
`https://your-domain.com/.well-known/farcaster.json`> Note:
Want to learn more about manifests? 👉 Check out our [Manifest guide](/mini-apps/features/manifest).

## Sign Your Manifest

There are two supported ways to sign and generate your manifest:

<Tabs>
 <Tab title="Base Build" icon="star">
 ## Option 1: Base Build Preview Tool

1.  Visit [base.org](https://base.org) and sign in with your Base account.
2.  Open **Preview → Account Association**.
3.  Enter your Mini App domain in the App URL field.
4.  Click **Submit**. You should see a notification that you should verify your app ownership. Click **Verify → Sign**.
5.  Follow the on-screen instructions to sign the message in your wallet.
6.  Click **Copy** to copy the generated`accountAssociation`object.
7.  Paste it into your project’s`farcaster.json`under`accountAssociation`.
8.  Redeploy your application to production.

You should now see three green check marks indicating successful signing.

 <Tab title="Farcaster">
 ## Option 2: Farcaster Manifest Tool

1.  Go to [farcaster.xyz](https://farcaster.xyz) and log in.
2.  Navigate to **Developers → Manifest Tool**.
3.  Enter your domain (exclude `https://`and trailing slashes).
4.  Click **Refresh** to fetch your app.
5.  Select **Generate Account Association**.
6.  Copy the generated object.
7.  Paste it into your project’s`farcaster.json`under`accountAssociation`.
8.  Redeploy your application to production.

You should now see green check marks indicating successful signing.

## Example Manifest

Here’s a simplified example of what a `farcaster.json`could look like from the [Base Camp Mini App](https://basecamp25.app/.well-known/farcaster.json)

#### JSON```json

{
"accountAssociation": {
"header": "<generated-header>",
"payload": "<generated-payload>",
"signature": "<generated-signature>"
},
"miniapp": {
"version": "1",
"name": "Basecamp 2025", // App name
"description": "Access and manage your experience @ Basecamp",
"iconUrl": "https://basecamp25.app/icon.png // App icon
"homeUrl": "https://basecamp25.app // Landing page
"canonicalDomain": "basecamp25.app", // Must match your domain
"requiredChains": ["eip155:8453"], // Chains your app supports
"tags": ["basecamp", "miniapp"], // Optional tags
"requiredCapabilities": [ // Capabilities your app needs
"actions.ready",
"actions.signIn"
]
}
}

````# Design Guidelines

> Build a mini app that is intuitive and delightful to use.

### Display

See how your mini app is displayed in the Base app in our [Figma specification file](https://www.figma.com/design/4wx6s24NB0KLgprQAyMT8R/TBA-Mini-App-Specs)

### Layout

* Keep core actions visible near the top or middle of the screen — not hidden behind scrolls.
* Limit the number of buttons. Make it obvious what users should do first.
* Use clear primary calls to action (e.g., “Create”, “Start Game”, “Deposit”).
* Design for **small viewports** and **portrait orientation.**
* **Optimize for thumb reach and one-handed use.**

### Navigation

* Most mini apps should include a **bottom navigation bar**.



* Always include **labels under icons** so users understand each tab.

* Test on multiple device sizes to ensure buttons are not cut off.

### Colors

Use color to communicate clearly, express your brand, and create cohesive mini app experiences.

### **Color Palette**

* **Primary:** Brand color for CTAs and key interactions.
* **Secondary:** Complements primary; use for accents or secondary actions.
* **Neutral:** For text, backgrounds, and structure with strong contrast.

### **Themes**

* Support **light and dark modes**:
* Maintain contrast and brand consistency.
* Respect system preference but allow manual toggle.
* Use smooth transitions between themes.
* **💡Tip:** Use **semantic color tokens** (e.g.,`--color-primary`, `--color-background`) with **light/dark theme overrides** for maintainability and flexibility.

### Typography

* Ensure the fonts you use are easy to read. Our team recommends **Inter.**
* **Ensure sufficient contrast between text and background colors** to make reading easy under various lighting conditions.
* **Stick to regular, bold, and italic as needed.** Decorative or script fonts should be reserved for accents, not body text.

### Spacing

* Groups related elements together.
* Consistent spacing: Creates visual rhythm and predictability with consistent spacing.
* Give content room to breathe with white space.
* Avoid cramped layouts.
* Base Unit: Start with a base spacing unit (typically **4px** or **8px**) and maintain consistency throughout:
 * 4px base: More granular control, better for mobile.
 * 8px base: Easier mental math, good for desktop.

### Touch Interactions

* Ensure all touch targets are at least **44px**.
* Support common gestures (tap, swipe, pinch) where appropriate.
* Don’t rely on **hover states** — they don’t exist on touch screens.





#### Ek Varyant 2



> Build a mini app that is intuitive and delightful to use.

### Display

See how your mini app is displayed in the Base app in our [Figma specification file](https://www.figma.com/design/4wx6s24NB0KLgprQAyMT8R/TBA-Mini-App-Specs)

### Layout

* Keep core actions visible near the top or middle of the screen — not hidden behind scrolls.
* Limit the number of buttons. Make it obvious what users should do first.
* Use clear primary calls to action (e.g., “Create”, “Start Game”, “Deposit”).
* Design for **small viewports** and **portrait orientation.**
* **Optimize for thumb reach and one-handed use.**





#### Ek Varyant 3



> Build a mini app that is intuitive and delightful to use.

### Display

See how your mini app is displayed in the Base app in our [Figma specification file](https://www.figma.com/design/4wx6s24NB0KLgprQAyMT8R/TBA-Mini-App-Specs)

### Layout

* Keep core actions visible near the top or middle of the screen — not hidden behind scrolls.
* Limit the number of buttons. Make it obvious what users should do first.
* Use clear primary calls to action (e.g., “Create”, “Start Game”, “Deposit”).
* Design for **small viewports** and **portrait orientation.**
* **Optimize for thumb reach and one-handed use.**

### Navigation

* Most mini apps should include a **bottom navigation bar**.


* Always include **labels under icons** so users understand each tab.

* Test on multiple device sizes to ensure buttons are not cut off.

### Colors

Use color to communicate clearly, express your brand, and create cohesive mini app experiences.

### **Color Palette**

* **Primary:** Brand color for CTAs and key interactions.
* **Secondary:** Complements primary; use for accents or secondary actions.
* **Neutral:** For text, backgrounds, and structure with strong contrast.

### **Themes**

* Support **light and dark modes**:
* Maintain contrast and brand consistency.
* Respect system preference but allow manual toggle.
* Use smooth transitions between themes.
* **💡Tip:** Use **semantic color tokens** (e.g., `--color-primary`, `--color-background`) with **light/dark theme overrides** for maintainability and flexibility.

### Typography

* Ensure the fonts you use are easy to read. Our team recommends **Inter.**
* **Ensure sufficient contrast between text and background colors** to make reading easy under various lighting conditions.
* **Stick to regular, bold, and italic as needed.** Decorative or script fonts should be reserved for accents, not body text.

### Spacing

* Groups related elements together.
* Consistent spacing: Creates visual rhythm and predictability with consistent spacing.
* Give content room to breathe with white space.
* Avoid cramped layouts.
* Base Unit: Start with a base spacing unit (typically **4px** or **8px**) and maintain consistency throughout:
 * 4px base: More granular control, better for mobile.
 * 8px base: Easier mental math, good for desktop.

### Touch Interactions

* Ensure all touch targets are at least **44px**.
* Support common gestures (tap, swipe, pinch) where appropriate.
* Don’t rely on **hover states** — they don’t exist on touch screens.

# Generate Dynamic Embed Images

> Create viral loops by turning every user interaction into dynamic, shareable content directly in the feed.

Embeds are the first thing users see when they encounter your mini app in their feed. Each share can display unique, contextual content tailored to drive engagement.



 When users share your mini app `URL`, the Base app requests your page, reads the fc:miniapp metadata, and fetches the `imageUrl`. You can serve either a static file (same image for everyone) or a dynamic endpoint that generates unique images on-demand based on URL parameters.
</Panel>

<Note>
 This guide uses Minikit but the principles apply to any framework with server-side rendering.
</Note>

## Implementation

This guide shows how to create shareable links with dynamic embed images. Users click a share button, which opens a compose window with their personalized link. When shared, the embed displays a unique image with their username.


### Step: Install the required package
Install `@vercel/og`by running the following command inside your project directory. This isn't required for Next.js App Router projects, as the package is already included:
#### Command```bash
npm install @vercel/og
```### Step: Create the image generation API endpoint
Build an API route that generates images based on the username parameter.
#### Code```tsx
import { ImageResponse } from "next/og";

export const dynamic = "force-dynamic";

export async function GET(
 request: Request,
 { params }: { params: Promise<{ username: string }> }
) {
 const { username } = await params;

 return new ImageResponse(
(
 <div
 style={{
 backgroundColor: 'black',
 backgroundSize: '150px 150px',
 height: '100%',
 width: '100%',
 display: 'flex',
 color: 'white',
 textAlign: 'center',
 alignItems: 'center',
 justifyContent: 'center',
 flexDirection: 'column',
 flexWrap: 'nowrap',
 }}
>
 Hello {username}
</div>
),
{
 width: 1200,
 height: 630,
}
 );
}
```This endpoint generates a unique image for each username:`/api/og/alice`, `/api/og/bob`, etc.


> Warning:
`<div>`elements must have`display: "flex"`or`display: "none"`. If you see a 500 error when accessing `/share/[username]`, check your ImageResponse JSX structure.


### Step: Create shareable page with dynamic metadata
Build a page route that uses the username to generate `fc:miniapp`metadata pointing to your image endpoint.
#### Code```tsx
import { minikitConfig } from "../../../minikit.config";
import { Metadata } from "next";

export async function generateMetadata(
 { params }: { params: Promise<{ username: string }> }
): Promise<Metadata> {
 try {
const { username } = await params;

return {
 title: minikitConfig.miniapp.name,
 description: minikitConfig.miniapp.description,
 other: {
"fc:miniapp": JSON.stringify({
 version: minikitConfig.miniapp.version,
 imageUrl: `${minikitConfig.miniapp.homeUrl}/api/og/${username}`,
 button: {
 title: `Join the ${minikitConfig.miniapp.name} Waitlist`,
 action: {
 name: `Launch ${minikitConfig.miniapp.name}`,
 type: "launch_frame",
 url: `${minikitConfig.miniapp.homeUrl}`,
 },
 },
}),
 },
};
 } catch (e) {
const errorMessage = e instanceof Error ? e.message : 'Unknown error';
console.log(JSON.stringify({
 timestamp: new Date.toISOString,
 level: 'error',
 message: 'Failed to generate metadata',
 error: errorMessage
}));

return {
 title: minikitConfig.miniapp.name,
 description: minikitConfig.miniapp.description,
};
 }
}

export default async function SharePage(
 { params }: { params: Promise<{ username: string }> }
) {
 const { username } = await params;

 return (
<div>
 <h1>Share Page - {username}</h1>
</div>
 );
}
```When someone visits`/share/alice`, the metadata points to `/api/og/alice`for the embed image.

### Step: Add share button with composeCast
Create a button that opens Farcaster's compose window with the user's personalized share link.
#### Code```tsx
import { useMiniKit, useComposeCast } from "@coinbase/onchainkit/minikit";
import { minikitConfig } from "./minikit.config";

export default function HomePage {
 const { context } = useMiniKit;
 const { composeCast } = useComposeCast;


 const handleShareApp = => {
const userName = context?.user?.displayName || 'anonymous';
composeCast({
 text: `Check out ${minikitConfig.miniapp.name}!`,
 embeds: [`${window.location.origin}/share/${userName}`]
});
 };

 return (
<div>
 <button onClick={handleShareApp}>
Share Mini App
 </button>
</div>
 );
}
```When you click the button, it opens the compose window with`/share/alice`as the embed. The embed displays the dynamic image from`/api/og/alice`.

### Step: Test the flow
Verify the complete sharing flow works.
#### Command
```bash
# Start your app
npm run dev

# Test the image endpoint directly
curl http://localhost:3000/api/og/testuser > test.png
open test.png

# Visit the share page to verify metadata
curl http://localhost:3000/share/testuser | grep "fc:miniapp"
```Click the share button in your app to test the full experience. You should see the compose window open with your personalized share link, and the embed should display your custom generated image.

## Related Concepts



- [Troubleshooting](/mini-apps/troubleshooting/how-search-works)



# Send Notifications (Neynar)

> Learn how to engage users through in-app notifications using Neynar

## Overview

If your app doesn't have a backend, if you're already using Neynar, or if you would rather use a hosted solution instead of [implementing notification logic](/mini-apps/core-concepts/notifications) in your backend, we recommend using Neynar for notifications. [**Neynar**](https://neynar.com/) is an infrastructure platform for building mini apps on Base.

Neynar's solution allows you to:

* Manage notification infrastructure (tokens, permissions, batching) in a single UI
* Send via API or Neynar developer portal UI—no code required
* Track notification performance with built-in analytics
* Target specific user cohorts with advanced segmentation

## Prerequisites

* A Base App account
* A mini app with the [Farcaster SDK](https://miniapps.farcaster.xyz/docs/getting-started#manual-setup) implemented
* Neynar developer account -- sign up for free [Neynar Com](https://neynar.com)

## Enable Notifications


### Step: Set up Notifications on Neynar
The Neynar mini app events webhook URL is on the Neynar app page.

 Navigate to [dev.neynar.com/app](https://dev.neynar.com/app) and then click on the app.

 Copy the url under **Mini app Notifications**.

 ![](https://mintcdn.com/base-a060aa97/7Lsdarakb-9Agcjf/images/miniapps/neynar-notification-webhook.png?fit=max&auto=format&n=7Lsdarakb-9Agcjf&q=85&s=c23e17eac0255b752581673a06025398)

### Step: Add Webhook URL to Manifest
Paste the url you copied from the **Mini app Notifications** field in the step above into the`webhookUrl`field in the`miniapp`object inside your manifest.

 Here's an example manifest with the updated`webhookUrl`field:
#### JSON```json
{
 "accountAssociation": {
"header": "eyJmaWQiOjE5MSwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweDNhNmRkNTY5ZEU4NEM5MTgyOEZjNDJEQ0UyMGY1QjgyN0UwRUY1QzUifQ",
"payload": "eyJkb21haW4iOiIxYmNlLTczLTcwLTE2OC0yMDUubmdyb2stZnJlZS5hcHAifQ",
"signature": "MHg1ZDU1MzFiZWQwNGZjYTc5NjllNDIzNmY1OTY0ZGU1NDMwNjE1YTdkOTE3OWNhZjE1YjQ5M2MxYWQyNWUzMTIyM2NkMmViNWQyMjFhZjkxYTYzM2NkNWU3NDczNmQzYmE4NjI4MmFiMTU4Y2JhNGY0ZWRkOTQ3ODlkNmM2OTJlNDFi"
 },
 "miniapp": {
"version": "4.2.0",
"name": "Your Mini App Name",
"iconUrl": "https://your-miniapp-domain.com/icon.png
"splashImageUrl": "https://your-miniapp-domain.com/splash.png
"splashBackgroundColor": "#f7f7f7",
"homeUrl": "https://your-miniapp-domain.com
"webhookUrl": "https://docs.neynar.com/reference/publish-frame-notifications
 }
}
```> Warning:
Caching: The Base App might have your mini app manifest cached. To make sure all changes have taken effect, repost your application to the Base App.

> Note:
Test your Mini App in [Base Build](https://base.dev/preview) using the Preview tool. Once signed in, paste your app's URL in the`App URL`field and click the`Submit`button.


## Prompt Users to Add Your App

To send notifications to users, they must first add your app.


### Step: Install the Neynar React package
#### Command```shell
npm install @neynar/react
```### Step: Prompt users to add your Mini App
Use the`addMiniApp`hook to prompt users to add your Mini App.

 Neynar will manage all [notification events](/mini-apps/core-concepts/notifications#events) which tell your app when a user has enabled or disabled notifications for your mini app.

 To confirm that the mini app was added and notifications were enabled, check`result.added`is true and`result.notificationDetails`is a valid object.```javascript
import { useMiniApp } from '@neynar/react';

export default function HomePage {
 const { isSDKLoaded, addMiniApp } = useMiniApp;

 const handleAddMiniApp = async => {
if (!isSDKLoaded) return;

const result = await addMiniApp;
if (result.added && result.notificationDetails) {
 // Mini app was added and notifications were enabled
 console.log('Notification token:', result.notificationDetails.token);
}
 };

 return (
<button onClick={handleAddMiniApp}>
 Add Mini App
</button>
 );
}
```## Send Notifications to Users

Neynar makes it easy to send notifications to all users who have enabled notifications or to a subset based on filter criteria you define.

### Option 1: API

You can programmatically send notifications using the Neynar API. This gives you full control over targeting and filtering users.


### Step: Install the Neynar Node.js SDK
Install the [@neynar/nodejs-sdk](https://github.com/neynarxyz/nodejs-sdk) package:
#### Command```shell
npm install @neynar/nodejs-sdk
```### Step: Create a notification sending function
Create a reusable function to send notifications with targeting and filtering capabilities:```javascript
import { NeynarAPIClient } from "@neynar/nodejs-sdk";

const client = new NeynarAPIClient(process.env.NEYNAR_API_KEY);

/**
 * Send a notification to mini app users
 * @param {number[]} targetFids - Array of FIDs to target (empty array = all users with notifications enabled)
 * @param {Object} filters - Optional filters to narrow down recipients
 * @param {Object} notification - Notification content and target URL
 */
export async function sendNotification(targetFids, filters, notification) {
 try {
const response = await client.publishFrameNotifications({
 targetFids,
 filters,
 notification,
});

return {
 success: true,
 data: response,
};
 } catch (error) {
console.error("Failed to send notification:", error);
return {
 success: false,
 error: error.message,
};
 }
}
```### Step: Send notifications
Use the function to broadcast notifications with advanced filtering criteria:```javascript
import { sendNotification } from './lib/sendNotification';

// Define target FIDs (empty array targets all users with notifications enabled)
const targetFids = [];

// Define filters to narrow down recipients
const filters = {
 exclude_fids: [420, 69], // Exclude specific FIDs
 following_fid: 3, // Only send to users following this FID
 minimum_user_score: 0.5, // Only send to users with score >= this value
 near_location: { // Only send to users near a specific location
latitude: 34.052235,
longitude: -118.243683,
radius: 50000, // Distance in meters (optional, defaults to 50km)
 }
};

// Define notification content
const notification = {
 title: "🪐",
 body: "It's time to savor farcaster",
 target_url: "https://your-miniapp-domain.com/notification-destination
};

// Send the notification
const result = await sendNotification(targetFids, filters, notification);

if (result.success) {
 console.log("Notification sent successfully:", result.data);
} else {
 console.error("Failed to send notification:", result.error);
}
```> Note:
The`target_fids`parameter is the starting point for all filtering. Pass an empty array to target all users with notifications enabled, or specify FIDs to target specific users.


### Option 2: Neynar UI

The [Neynar dev portal](https://dev.neynar.com) offers the same functionality as the API for broadcasting notifications. Navigate to your app and click the "Mini App" tab. Once your mini app is configured with your Neynar webhook URL and users have enabled notifications for your mini app, you'll see a "Broadcast Notification" section with an expandable filters section.


### Step: Log in to the Neynar Dev Portal
[https://dev.neynar.com/home

### Step: Click the Broadcast button
Once you have filled in the notification details and applied any filtering, broadcast your notification by clicking the broadcast button at the bottom of the page.

Additional documentation on the API and its body parameters can be found at [publish-miniapp-notifications](https://docs.neynar.com/reference/publish-frame-notifications)

# Featured Checklist

> Build high quality mini apps to get more distribution.

Your app must meet all product, design, and technical guidelines outlined below. Meeting these guidelines is a prerequisite for featured placement, but **does not guarantee placement**. Base holds a very high bar for featured placement.

<Note>
 To submit your app for featured placement, first verify your mini app in the [Base Build dashboard](https://base.dev/ then fill out the [submission form](https://buildonbase.deform.cc/getstarted/)
</Note>

<Steps titleSize="h3">

### Step: Authentication
* In-app authentication stays within the Base app with no external redirects
 * Wallet connection happens automatically
 * No email or phone verification inside the app

### Step: Onboarding Flow
* Explain the purpose of the app and how to get started, with clear onboarding instructions either on the home page or as a a pop-up window.
 * App only requests essential personal information, with clear context
 * Display user's avatar and username **(no 0x addresses)**

### Step: Base Compatibility
* App is client-agnostic, with no hard-coded Farcaster text or links, or other client-specific behavior
 * Transactions are sponsored

### Step: Layout
* Call to actions are visible and centered on page
 * App has a bottom navigation bar or side menu to easily access core flow
 * All buttons are accessible and not cut off
 * Navigation bar items have clear, understandable labels

### Step: Load Time
* App loads within **3 seconds**

 * In-app actions complete within **1 second**

 * Loading indicators are shown during actions

### Step: Usability
* App supports **light and dark modes** consistently
 * App has minimum **44px touch targets**

### Step: App Metadata
* App description is clear, concise, and user-focused
 * App icon is **1024×1024 px**, PNG, **no transparency**, readable at small sizes
 * App cover photo is **high quality** and does not contain Base logo or team photos

## Next Steps



- [Product Guidelines](/mini-apps/featured-guidelines/product-guidelines)



- [Design Guidelines](/mini-apps/featured-guidelines/design-guidelines)



- [Technical Guidelines](/mini-apps/featured-guidelines/technical-guidelines)



- [Notification Guidelines](/mini-apps/featured-guidelines/notification-guidelines)



# Product Guidelines

## Load Time

* Apps should load within **3 seconds**, and in-app actions should complete within **1 second**.
* Always show a **loading indicator** when an action is in progress.

## Onboarding Flow

* When a user opens your mini app for the first time, they should see a brief, informative screen explaining what the mini app does and how to get started. Keep this limited to 3 screens, and use succinct language and images.


 <div style={{ fontSize: 14, color: '#6b7280' }}><a href="https://www.boleromusic.com/ target="_blank" rel="noopener noreferrer">Example onboarding flow</a></div>
</div>

## User Information & Privacy

* Only ask for personal information when absolutely necessary. Give users context and explain the value of using the app **before** asking for private information.
* Always explain why the information is needed. Respect user privacy and data minimization principles.

## User Profile

* Show the user’s profile somewhere on the screen, and include their avatar and username used on the Base app
* **Avoid showing 0x addresses in your mini app.**

## App Description

* Your mini app should have a clear, simple value proposition that makes sense to anyone.
* Describe what your app does and why it matters in one sentence.
* **Keep your messaging human, concise, and benefit-focused.**

***Examples**:* “Earn and borrow on your terms”, “Create and share art that lives onchain”

## App Cover Photo

**Do’s ✅**

* Your app’s visuals should make users want to click in and explore.
* Include a high-quality cover image that feels trustworthy and engaging.
* Ensure no typos or visual clutter in the image.

**Don’ts ❌**

* Include the Base logo in your cover photo.
* Include photos of your team


 <div style={{ fontSize: 14, color: '#6b7280' }}><a href="https://app.morpho.org/base/earn target="_blank" rel="noopener noreferrer">Example cover photo</a></div>
</div>

## App Icon

* **Design clear, recognizable icons:** Use bold, simple shapes and high contrast; avoid fine details so icons remain clear at **16×16px**.
* **Follow icon specs**
 * Size: **1024×1024px**
 * Format: **PNG (no alpha transparency)**
 * Defined via`iconUrl`in`farcaster.json`# Notification Guidelines

> Well designed notifications re-engage users, driving retention, and highlight key moments

Notifications will allow you to re-engage users who have saved your Mini App, driving retention and bringing users back at key moments like new content releases, achievements, or time-sensitive events.

Focus on sending updates that are relevant, well-timed, and valuable. It’s important to balance how many notifications you send — too many can cause users to turn them off entirely.

# Anatomy

* Title
 * Short, clear statement of feature or what’s happening
 * Max length 32 characters
* Body
 * Supporting detail or call-to-action
 * Max length 128 characters
* targetURL
 * URL to open when the user clicks the notification
 * Max length 1024 characters.Must be on the same domain as the Mini App.

# Best practices

1. **Keep notifications short and clear**\
 Each notification should be easy to scan. Use the title to state the key details, and keep the body text brief and focused on value. Users should know at a glance what is happening and why it matters.

2. **Control frequency**\
 Send notifications sparingly. Stay well below the enforced limit (1 every 30 seconds, maximum 100 per day) to avoid users from turning off notifications from your mini app. Focus on moments that truly benefit the user, and avoid sending multiple alerts close together.

3. **Deliver at the right time**\
 Timing shapes how notifications feel. Send them when they’re most relevant, such as after an event or during active hours. Avoid off-hours or interrupting while users are already in your mini app. Well-timed notifications feel helpful, not disruptive.

4. **Measure and refine**\
 Analytics reveal whether your notifications are working. High click-through rates show value, rising disabled rates mean you’re overwhelming users. Use these signals to adjust content, timing, or cadence so notifications remain useful.

# Types of notifications

Different mini apps use notifications in different ways. Choose the type that best fits your app’s purpose, and always keep the message relevant.

* **Reminders** encourage users to return regularly
 * “Your crops are ready to harvest!
* **Events driven updates** highlight something new or time sensitive.
 * “BTC is up 5% today! Check your portfolio”
* **Feature announcements** showcase new functionality or opportunities
 * Example: “New quest unlocked! More Coins are waiting for you!”
* **Alerts/warnings** share urgent or critical information
 * Example: “Your balance is low. Top up to keep trading”

Not every message deserves to be a notification, here are some to avoid:

* **Avoid overly generic nudges**. Messages with no clear value feel spammy, always explain why it matter to the user
 * Example: “Open the app today!”
* **Avoid unnecessary confirmations**. Notifications should only confirm meaningful or irreversible events like payments or shipments
 * Example: “You liked a post”

# Technical Guidelines

> Ensure your mini app is built for the Base app

## Complete Metadata

Metadata includes your manifest and embed metadata. Complete, valid metadata is required for indexing, category placement, and high‑quality embeds.

**Acceptance Criteria**

* Manifest is publicly accessible at`/.well-known/farcaster.json`
* Required fields are present and valid (`accountAssociation`, `frame`, `primaryCategory`, `tags`)
* Images meet size/format constraints; text fields respect length limits

**How to Implement**

* Follow the [Manifest guide](/mini-apps/core-concepts/manifest)
* Implement [embed metadata](/mini-apps/core-concepts/embeds-and-previews#implementation)

<Note>
 Validate your manifest using our preview tools at <a href="https://base.dev/preview>base.dev/preview</a>.
</Note>

## In-app Authentication

Users must remain in the Base app throughout the authentication flow. Eliminate flows that bounce users out of the Base app.

**Acceptance Criteria**

* No external redirects
* No email / phone verification
* Users can explore before sign‑in when possible

**How to Implement**

* Follow the [Authentication guide](/mini-apps/core-concepts/authentication)
* Prefer in‑app SIWF/Quick Auth or wallet auth;

## Client-Agnostic

There must be no client‑specific behaviors or wording that degrade the experience in the Base app. You must also ensure that you don't redirect the user to another client for functionality supported in the Base app.

**Acceptance criteria**

* Do not hardcode client‑specific URLs (e.g., Farcaster‑only links)
* Use neutral language in UI (e.g. use "Share to Feed" instead of "Share to Farcaster")
* Eliminate buttons that deeplink to other clients for features supported in the Base app

**How to Implement**

* Update all links according to the [Links](/mini-apps/technical-guides/links) guide
* Review the [Base App Compatability](/mini-apps/troubleshooting/base-app-compatibility) guide for functionality not supported in the Base app. All other functionality must keep users in the Base app.

## Sponsor Transactions

Sponsor transaction fees to remove friction and reduce drop‑off for new users. For mini apps on Base, we recommend using the [Base Paymaster](/onchainkit/paymaster/quickstart-guide).

**Acceptance criteria**

* Transactions are sponsored via a paymaster

**How to Implement**

* Recommended: [Base Paymaster](/onchainkit/paymaster/quickstart-guide)

<Note>
 Claim free gas credits on <a href="https://base.dev>base.dev</a>.
</Note>

## Batch Transactions (EIP-5792)

Batch sequential actions where applicable to minimize signatures and reduce friction. Use EIP‑5792 capabilities to send multiple calls in one request.

**Acceptance criteria**

* Where applicable, combine sequential actions into a single batch (e.g. approve + swap)

**How to Implement**

* See [Batch Transactions](/base-account/improve-ux/batch-transactions)
* Provider APIs: [`wallet_sendCalls`](/base-account/reference/core/provider-rpc-methods/wallet_sendCalls), [`wallet_getCapabilities`](/base-account/reference/core/provider-rpc-methods/wallet_getCapabilities)

# Why Mini Apps

> Discover how Mini Apps eliminate friction and leverage social distribution to create instantly engaging, viral experiences that traditional apps can't match.

The next evolution of digital experiences extends beyond app stores into social feeds and direct messages. Mini Apps are lightweight, social-native apps that launch instantly when you tap them: no downloads, no friction, just immediate engagement. While the Base App provides the discoverability through social distribution and featured listings, Mini Apps deliver the frictionless experience that makes instant trial and viral sharing possible.

<Note>
 Existing web applications can be converted into Mini Apps. Learn how to [integrate your existing app](/mini-apps/quickstart/existing-apps/install) with our helpful guide.
</Note>


> Note:
**Framework Compatibility Note**
 Mini apps built with either the [Farcaster SDK](https://miniapps.farcaster.xyz/) or MiniKit both work seamlessly in the Base app. Choose the framework that best fits your development preferences

## Beyond the App Store Model

Traditional apps face costly user acquisition because they're buried among millions of competitors in app stores, require separate iOS and Android development with ongoing maintenance across platforms, and create commitment friction through installation requirements. Mini Apps eliminate these barriers entirely by running as lightweight web applications that work instantly across all devices, deploy with zero installation friction, and spread organically through social feeds where users naturally discover content—turning every interaction into potential viral distribution that no app store algorithm can match.



- Traditional Apps



- Mini Apps



## What Makes Mini Apps Different

### For Users: Frictionless Discovery and Engagement

Mini Apps eliminate the gap between discovery and engagement. Instead of downloading apps you might never use again, you can instantly try interactive experiences shared by friends. With leaderboards, challenges, and multiplayer features, these apps transform from individual experiences into social activities you do with your friends—competing, collaborating, and sharing achievements together.

### For Builders: Built-in Social Infrastructure

As a developer, you build on top of existing social infrastructure instead of recreating it from scratch.

**What you get out of the box:**

* User identity and authentication
* Social connections and friend graphs
* Viral distribution mechanisms
* Immediate access to engaged communities

## The Builder's Advantage

Mini Apps solve three major product development challenges:

<Frame caption="Find users where they already are">
 ![](https://mintcdn.com/base-a060aa97/gS084HRa38b8UMsN/images/minikit/social_finding.gif?s=c0354f6297ab0447101d9d2d11ef9f5c)
<AccordionGroup>
 <Accordion title="Discovery Challenge" defaultOpen="true">
 **Traditional Apps:** Builders pay for ads and fight algorithms for visibility

 **Mini Apps Solution:** User activity appears organically in their social feed (followers, friends, connections), naturally inviting others through social proof via sharing.
 </Accordion>
</AccordionGroup>

<Frame caption="User Acquisition">
 ![](https://mintcdn.com/base-a060aa97/gS084HRa38b8UMsN/images/minikit/distribution.gif?s=8afff3c64f58f92462f129c86732adb3)
<AccordionGroup>
 <Accordion title="User Acquisition Challenge" defaultOpen="true">
 **Traditional Apps:** Expensive campaigns with low conversion rates.

 **Mini Apps Solution:** Every interaction becomes viral distribution. Users broadcast engagement to their entire network, creating compound growth loops that traditional apps can't achieve.
 </Accordion>
</AccordionGroup>

<Frame caption="Enagement">
 ![](https://mintcdn.com/base-a060aa97/gS084HRa38b8UMsN/images/minikit/friends_in_game.gif?s=253ae29e8b51326cc1300aa6a13c20c7)
<AccordionGroup>
 <Accordion title="Engagement Challenge" defaultOpen="true">
 **Traditional Apps:** Users start alone and build social graphs slowly.

 **Mini Apps Solution:** Launch directly into existing friend groups, see live activity from friends, and join conversations already in progress.
 </Accordion>
</AccordionGroup>

## The Network Effect Advantage


As more people interact with these apps, they create valuable user activity and market opportunities that attract talented builders to Base, who see the engaged audience and build even better, more innovative experiences to capture that demand.This self-reinforcing cycle means every successful app strengthens the entire network, creating exponential growth that benefits every builder on Base.

## What You Can Build

The most successful Mini Apps solve everyday problems with built-in social mechanics:

<Tabs>
 <Tab title="Games & Entertainment">
 * Multiplayer games with real-time competition
 * Trivia nights with friend groups
 * Interactive stories and collaborative experiences
 </Tab>

 <Tab title="Shopping & Commerce">
 * Group buying for better discounts
 * Product recommendations from trusted friends
 * Collaborative wish lists and gift planning
 </Tab>

 <Tab title="Social Coordination">
 * Event planning with built-in RSVP tracking
 * Group dining decisions with real-time voting
 * Expense splitting with transparent calculations
 * Travel planning with collaborative itineraries
 </Tab>

 <Tab title="Creative & Learning">
 * Collaborative art and design projects
 * Study groups with progress tracking
 * Skill-sharing marketplaces
 * Book clubs and discussion forums
 </Tab>
</Tabs>


> Note:
**The winning pattern:** Take activities people already do individually or struggle to coordinate with others, then make them social, transparent, and immediate.

## From Idea to Live Application

The development path is streamlined and permissionless:


### Step: Build your Mini App
Use [MiniKit](/mini-apps/quickstart/new-apps/install) or the [Farcaster SDK](https://miniapps.farcaster.xyz/docs/getting-started) to create your application.

### Step: Deploy directly
Deploy your Mini App without waiting for approval processes or store reviews.

### Step: Get discovered automatically
Post your Mini App to Base App and it gets automatically indexed for discovery. No special permissions or approval processes required to show up in the Base App.

 Your app becomes instantly discoverable in:

 * Base App search results
 * The broader Farcaster ecosystem
 * User social feeds through organic sharing

### Step: Iterate based on real usage
Monitor actual usage patterns and iterate based on real user feedback rather than building in isolation.

## Start Building Today

Mini Apps represent a fundamental shift toward social-native digital experiences. The advantage goes to builders who understand that in a social-first world, distribution and engagement are built into the platform itself.



- [Quick Start Guide](/mini-apps/quickstart/new-apps/install)



- [Existing App Integration](/mini-apps/quickstart/existing-apps/install)




# Optimize Onboarding

> Reduce friction with wallet‑optional flows and clear value moments

Optimize your onboarding flow to increase user engagement and retention. This guide outlines the best practices that will keep your users in-app and engaged.

### Overview

Deliver value instantly and avoid blocking actions.

* Make the first interaction instant and non-blocking
* Authenticate only when required for security purposes and defer prompts until necessary
* Prefer the built-in Base Account; only offer connect/switch for alternate wallets, never gating
* Use progressive disclosure tied to intent (buy, post, personalize)
* Keep users in-app with [SDK actions for links](/mini-apps/features/links); avoid fragile static urls

### Recommended onboarding flow


### Step: First render
* Show immediate value (demo content, sample state, or read-only mode)
 * Personalize instantly with [`context`](/onchainkit/latest/components/minikit/provider-and-initialization) of the user's profile to instantly personalize
 * Display one clear CTA that leads to a meaningful action (e.g. "Post a message", "Buy a token", "Follow a user")

### Step: User initiates a protected action
* Trigger Sign In with Farcaster (SIWF) / Quick Auth only when needed per [Authentication](/mini-apps/features/Authentication)
 * For onchain actions, use the Base Account automatically. Eliminate explicit wallet connect flows
 * Alternate wallets: offer a non-blocking connect/switch option without gating exploration

### Step: Celebrate and amplify
* After success, prompt social actions via [SDK actions](/mini-apps/features/links) and [Sharing & Social Graph](/mini-apps/features/sharing-and-social-graph)
 * Offer next step: save, follow, or share — optimize with [Search & Discovery](/mini-apps/troubleshooting/how-search-works)

### UX patterns that work


> Note:
* Progressive prompts: ask only when needed (buy, post, personalize)
 * Clear copy: explain why you’re asking ("Sign in to save your score")

* One-time deep link (Connect Account users): if SIWF requires a one-time Farcaster link to register auth address, message it as a quick, one-time setup and return the user seamlessly
* Friendly fallbacks: if auth is skipped or fails, allow continued browsing in read-only mode

### Authentication and wallet guidance

#### Authentication

* Only when your backend needs a verified user
* Use SIWF/Quick Auth to issue a session (JWT) when required


> Warning:
Do not treat Mini App context as primary auth (it can be spoofed)

Read more in [Authentication](/mini-apps/features/Authentication).

#### Wallets

* Base App provides an in-app Base Account. This should be the default wallet used by your app to streamline interactions.
* Do not show a connect button on first load
* If you support other wallets, show connect/switch as optional and non-blocking
* Use the OnchainKit Wallet component or Wagmi hooks as needed

### Do not use raw deeplinks


> Warning:
* Always use official SDK actions for cross-client compatibility (e.g., compose cast, view profile)
 * This prevents dead ends and ensures consistent behavior across hosts

Learn how to implement them with [SDK actions](/mini-apps/features/links).

### Measure activation and iterate

<Info>
 * Define activation as the first successful protected action (e.g., first post, first onchain action)
 * Track funnel: first render → intent click → auth/wallet prompt → success → share/save
</Info>

* Break down Create Account vs Connect Account behavior to spot friction
* See: Base Build Analytics (coming soon)

### Implementation checklist

<Check>
 * Landing screen is usable without auth or wallet prompts
 * Trigger SIWF/Quick Auth only when backend needs it
</Check>

* Use MiniKit context for analytics only; avoid using it as primary auth
* Use Base Account seamlessly for onchain actions; no upfront connect flow
* If supporting alternate wallets, provide optional, non-blocking connect/switch
* Use SDK actions for social flows (compose/view) instead of deeplinks
* Provide a post-success share step and clear next action
* Test both Create Account and Connect Account paths

### Further reading



- [Authentication](/mini-apps/features/Authentication)



- [Links & SDK Actions](/mini-apps/features/links)



- [Search & Discovery](/mini-apps/technical-guides/search-discovery)





- [Sharing & Social Graph](/mini-apps/features/sharing-and-social-graph)



- [Provider & Initialization](/onchainkit/latest/components/minikit/provider-and-initialization)



- [useAuthenticate](/onchainkit/latest/components/minikit/hooks/useAuthenticate)



# Ideating Viral Apps

> Designing mini apps that people actually come back to

**Designing mini apps that people actually come back to.**

Most apps can launch. But few become part of someone's daily rhythm.\
That's usually not a product problem. It's a people problem.

Social mini apps live or die based on how they make people feel: seen, connected, curious or like they belong. That's not something you tack on — it's something you build in from the start.

If you're designing for feed-based platforms (like Farcaster, Threads, or anything with posts, reactions, and reply chains), this guide will help you:



- Challenge your idea early



- Apply the right social patterns



- Build for behaviors, not just features



## How to Use This Guide

Welcome to your blueprint for designing social mini‑apps that people love to revisit. This guide is organized into distinct, actionable sections—each building on the last—to help you move from idea validation to deploying social features with purpose.


### Step: Pressure‑Test Your Idea
Before writing a single line of code or sketching UI, use our four diagnostic questions to see if your concept naturally supports social behavior. Drop your one‑line idea into the supplied prompt to get clear insights on post frequency, social lift, content momentum, and emotional payoff.

### Step: Interpret Feedback & Choose Dimensions
Analyze the responses. Identify which one or two social dimensions resonate
 most with your concept—whether it's habit formation, community spark, content
 growth, or emotional reward. The guide shows you how to validate and
 prioritize those dimensions before moving forward.

### Step: Apply a Case Study Flow
See a worked example that demonstrates how to translate test results into a
 prototype feature. This mini case study will illustrate rapid iteration,
 metric considerations, and how to decide when you're ready to scale social
 elements.

### Step: Explore Three Core Patterns
Dive into the heart of the guide—three social patterns designed to deepen engagement:

 * **Identity Playgrounds:** Customization and self‑expression
 * **Co‑Creation Loops:** Collaboration and building on each other's posts
 * **Long‑Term Rituals:** Scheduled, shared activities that foster habit and community

 Each pattern includes explanations, real‑world examples, and copy‑and‑paste prompts to spark your own brainstorming.

### Step: Next Steps & Reflection
Finish with a set of reflective questions and practical advice on measuring success. Use the closing prompts to refine your roadmap, plan experiments, and define key metrics for daily, weekly, and monthly engagement.

> Note:
**Tips for Getting the Most Out of This Guide:**

 * **Iterate Quickly:** Treat prompts and patterns as hypotheses. Prototype fast, gather data, and refine.
 * **Stay Human‑Centered:** At every stage, ask: "How will this make someone feel?"
 * **Measure What Matters:** Define metrics for each dimension early—then use them to validate your choices.
 * **Keep It Simple:** You don't need every pattern at once. Start with the one or two dimensions that align strongest with your concept.

## Pressure-test your idea

Before you get into features or UI, take a step back. Ask whether your idea wants to be social — or if you're forcing it. These prompts are designed to give you structured, clear feedback if you drop them into a LLM or use them in your own reflection.
```Here's a one-line description of my app: [insert idea].

Evaluate it across these questions:

1. Why would someone post here more than once?
2. Would the experience be better with another person involved?
3. What kind of content might naturally fill the feed over time?
4. What emotional reward might someone feel when they open it?

Please be direct. If the idea lacks natural social behavior, suggest ways it could evolve.```## Social Patterns

### 1. Identity Playgrounds

**The idea:** Give people ways to explore, express, or shape their identity within the app.

**Why it works:** People don't just use feeds to consume — they use them to perform. Customization invites play, self-expression, and experimentation.

**Where it shows up:** Discord roles, Reddit flair, Tumblr themes.

**Use it for:** Differentiation, emotional investment, repeat posting.```Given my app idea: [insert idea], explore 2 ways users might express or explore identity.

For each, include:
– What the user customizes or signals
– How that shows up in the feed
– Why that might matter over time```### 2. Co-Creation Loops

**The idea:** Design behaviors that are better when shared — where users build on each other's contributions.

**Why it works:** The strongest feeds don't just display content; they build momentum. If one person's post sparks another, you get a chain reaction.

**Where it shows up:** Remix threads, collab playlists, group journaling.

**Use it for:** Participation loops, content momentum, chain reactions.```How could users in [insert app idea] create something together or build on each other's actions?
Return 3 co-creation flows that include:
– What kicks it off
– How others join in
– What the feed looks like after a few days```### 3. Long-Term Rituals

**The idea:** Introduce regular, shared behaviors that become a rhythm.

**Why it works:** Rituals create predictability, belonging, and anticipation. They give users a reason to come back on a schedule.

**Where it shows up:** Wordle scores, Monday memes, Friday drops, yearly Spotify Wrapped.

**Use it for:** Habit loops, appointment-based engagement, social cohesion.```Design 2 recurring rituals for [insert app idea].

For each, include:
– Frequency (daily, weekly, monthly)
– What users post
– What emotion or payoff they get
– How it could spread through the feed```## Interpreting your feedback

After you get back raw answers to the four pressure‑test questions, look for the one or two dimensions that most naturally fit your idea. Nail those first, then decide if you need to shore up any others.


### Step: Spot your top dimensions
Scan your AI responses for signs of strength in these four key areas:



- Repeat‑posting potential



- Social lift



- Content momentum



- Emotional payoff




> Note:
Focus on the dimensions where the AI feedback was most enthusiastic and specific. Vague responses usually indicate weak social potential.


### Step: Validate your winners
For each dimension that scored well, confirm the feedback includes clear, actionable examples:

 <AccordionGroup>
 <Accordion title="Repeat‑posting validation">
 **Strong signal:** At least 1 post per week feels natural to users

 **Examples to look for:**

 * "Users would naturally share daily progress"
 * "Weekly challenges create posting rhythm"
 * "Status updates become habitual"

 **Red flag:** Forced or infrequent posting suggestions
 </Accordion>

 <Accordion title="Social lift validation">
 **Strong signal:** Others are meaningfully involved, not just passive viewers

 **Examples to look for:**

 * "Friends can collaborate on projects"
 * "Comments turn into conversations"
 * "Peer reactions drive engagement"

 **Red flag:** Social features feel like an afterthought
 </Accordion>

 <Accordion title="Content momentum validation">
 **Strong signal:** Community‑driven growth that builds over time

 **Examples to look for:**

 * "Posts inspire similar content from others"
 * "Popular topics emerge naturally"
 * "User‑generated content feeds itself"

 **Red flag:** Content relies entirely on individual creators
 </Accordion>

 <Accordion title="Emotional payoff validation">
 **Strong signal:** Opening the app delivers a felt reward

 **Examples to look for:**

 * "Users feel proud sharing progress"
 * "Achievements create satisfaction"
 * "Community recognition feels meaningful"

 **Red flag:** Emotional benefits are unclear or generic
 </Accordion>
 </AccordionGroup>

### Step: Decide your next move
Now that you've identified your strongest dimensions, here's how to proceed:

 <Tabs>
 <Tab title="Strong Dimensions (2+)">
 **You're ready to build!**

 If your top 1–2 dimensions check out, skip straight to building social features around them. You don't need to perfect all four dimensions before starting.

 <Check>
 Focus your energy on the social angles that truly resonate with your concept first.
 </Check>
 </Tab>

 <Tab title="Weak Dimensions (0-1)">
 **Iterate before building**

 If your dimensions are weak, spend time strengthening them before moving to development:

 * **Add a relational hook** (how do others get involved?)
 * **Include a habit prompt** (what brings people back?)
 * **Create emotional stakes** (why should users care?)


> Warning:
Don't force social features onto an inherently solo experience. Consider if your idea needs to evolve.

</Tab>
 </Tabs>

 **Example Decision Flow:**

 You see strong **"Social lift"** ("Friends' reactions spark threads") and decent **"Emotional payoff"** ("Likes feel rewarding").

 ✅ **Decision:** Prototype a co‑posting feature focusing on these strengths

 ⏳ **Later:** Explore "Content momentum" and "Repeat‑posting" patterns once core social features are solid

 <Info>
 This focused approach prevents feature bloat and ensures you build social mechanics that actually work for your specific concept.
 </Info>

## Closing note

The mini apps that thrive aren't the most complex — they're the ones that understand how people connect.

<Note>
 **Remember:**

 * Social features only work when they reflect real human behavior
 * A feed isn't just content — it's a shared ritual
 * True engagement comes from meaning over mechanics
</Note>

As you build, ask: *Why would someone want to come back? Why would they share this with a friend?* Those answers matter more than any feature list.

The best apps don't just fill feeds. They create places people want to return to.\
So — what will your app make people feel?


# Rewards

> Earn financial incentives for building high-quality Mini Apps that drive user engagement and onchain transactions

[Base.dev](https://www.base.dev/) rewards developers who build Mini Apps that deliver real value to users and drive meaningful onchain activity. You can earn rewards through verification programs, competitions, and partner opportunities.

## How Rewards Work


### Step: Verify your Mini App
Submit your Mini App to be verified on [Base.dev](https://www.base.dev/ This process validates your ownership of the mini app by adding Base builder address in the manifest.

### Step: Access earning opportunities
Participate in partner programs, competitions, and special campaigns to unlock additional revenue streams beyond standard rewards.


- [Submit for Verification](/mini-apps/featured-guidelines/overview)


## Next Steps

To maximize your chances of earning rewards, focus on user engagement and onchain activity from the very beginning—apps that deliver clear value to users consistently perform better in reward programs.

* [How to Build Viral Mini Apps](/mini-apps/growth/build-viral-mini-apps) - Learn proven tactics for social growth and sharing.
* [Design & UX Best Practices](/mini-apps/featured-guidelines/design-guidelines) - Create delightful, high-converting user experiences.
* [Thinking Social: Sharing & Social Graph](/mini-apps/features/sharing-and-social-graph) - Leverage social features to drive discovery and engagement.


# Common Issues & Debugging

> Frequent issues encountered during Mini App development and their solutions

## Prerequisites & Setup Verification

Ensure your Mini App has the foundational requirements in place.

### Required Files and Structure```text
your-domain.com/
├── .well-known/
│ └── farcaster.json # Required manifest file
├── your-app/
│ ├── index.html # Your app entry point
│ └── ... # Your app files
```### Environment Setup Checklist

* Domain is accessible via HTTPS
* Manifest file exists at`/.well-known/farcaster.json`* All image URLs are publicly accessible

# Debugging

Use Base Build's built-in Preview Tool for foundational debugging.


The **Preview tool** will help you:

* Validate your app's manifest and metadata
* Test how your app will appear in the Base app
* Verify ownership and account association

The Preview tool provides clear visual cues:

* ✅ Green check marks when things are set up correctly
* ❌ Red indicators when something needs your attention

### Components of the Preview Tool

The Preview tool has three main components:

* **Console**: Preview your app and review logs to make informed decisions about performance.
* **Account Association**: Confirm your app is linked to the correct account, signatures are valid, and the domain matches what’s specified in the manifest.
* **Metadata**: Ensure your Mini App renders exactly as expected by verifying required fields like name, icon, tags, and splash image.

### Basic Validation Steps

1. Test manifest accessibility: visit`https://yourdomain.com/.well-known/farcaster.json`2. Validate JSON syntax with JSONLint
3. Ensure your app loads without console errors

## Quick Diagnostic Workflow


> Note:
The best way to validate your app works is by using Base Build's built-in [Preview tool](https://base.dev/preview)
* Not appearing in search? → App Discovery & Indexing Issues
* Not rendering as an embed? → Embed Rendering Issues
* Wallet connection problems? → Wallet Connection Problems
* Need mobile testing tools? → Mobile Testing & Debugging
* Changes not appearing? → Manifest Configuration Problems
* App closes on gestures? → Gesture Conflicts and App Dismissal Issues

## Detailed Problem Solutions

### 1. App Discovery & Indexing Issues

Problem: Your Mini App doesn't appear in search results or app catalogs.

Root cause: Missing or incomplete manifest configuration.

Solution: Ensure your manifest includes all required fields (see Manifest feature guide).

Critical requirements:

*`primaryCategory`is required for searchability and category pages
*`accountAssociation`is required for verification

App Indexing Requirements:

1. Complete your manifest setup
2. Share your Mini App URL in a post
3. Indexing can take up to 10 minutes
4. Verify appearance in app catalogs

Caching Issues — Changes Not Appearing:

Farcaster clients may cache manifest data for up to 24 hours. Re‑share to trigger a refresh and allow \~10 minutes.

### 2. Manifest Configuration Problems

Image Display Issues:

1. Test image accessibility in incognito
2. Verify image format (PNG, JPG, WebP supported)
3. Check dimensions
4. Ensure HTTPS URLs only

### 3. Embed Rendering Issues

Problem: Your Mini App URL doesn't render as a rich embed when shared.

Root cause: Incorrect or missing`fc:frame`metadata.

Solution: Use`name="fc:frame"`meta tag in`<head>`and validate using the Embed Tool.

### 4. Wallet Connection Problems

Always use the user's connected wallet for optimal experience. You can do this either by using [OnchainKit's Wallet component](/onchainkit/wallet/wallet) or Wagmi hooks. Below is a Wagmi hook example:
#### Code```tsx
import { useAccount } from 'wagmi';

function MyComponent {
 const { address, isConnected } = useAccount;

 const walletConnected = isConnected;

 const userAddress = address; // Cryptographically verified

 return (
<div>
 {walletConnected && (
<p>Wallet: {userAddress}</p>
 )}
 {/* Use wallet data for secure operations */}
</div>
 );
}
```### 5. Gesture Conflicts and App Dismissal Issues

Disable native gestures when calling ready if you use swipe/drag interactions:
#### Code```ts
await sdk.actions.ready({ disableNativeGestures: true });
```### 6. Mobile Testing & Debugging

**Eruda Mobile Console Setup:**

Add Eruda for mobile console debugging during development:
#### Code```tsx
import { useEffect } from 'react';

export default function App {
 useEffect( => {
// Only load Eruda in development and not on localhost
if (typeof window !== 'undefined' &&
process.env.NODE_ENV === 'development' &&
!window.location.hostname.includes('localhost')) {
 import('eruda').then((eruda) => eruda.default.init);
}
 }, []);

 return (
<div>
 {/* Your app content */}
</div>
 );
}
```**Mobile Testing Workflow:**

1. Deploy to production or use ngrok for local testing
2. Share the mini app in a Farcaster DM to yourself
3. Open in mobile client (Base App, Farcaster)
4. Use Eruda console for debugging on mobile
5. Test across multiple clients for compatibility

**Testing Checklist:**

* [ ] App loads correctly on mobile devices
* [ ] Touch interactions work properly
* [ ] Viewport is correctly sized
* [ ] Images load and display correctly
* [ ] Console shows no critical errors

## Advanced Troubleshooting

**CBW Validator Tool:**

Use the Coinbase Wallet validator for Base App compatibility analysis. This AI-powered tool can identify unsupported patterns and suggest improvements.

**Complete Manifest Example:**
#### JSON```json
{
 "accountAssociation": {
"header": "your-farcaster-header",
"payload": "your-farcaster-payload",
"signature": "your-farcaster-signature"
 },
"baseBuilder": {
"ownerAddress": "0x..."
 },
 "frame": {
"name": "Your Mini App",
"iconUrl": "https://yourapp.com/icon.png
"homeUrl": "https://yourapp.com
"imageUrl": "https://yourapp.com/og.png
"buttonTitle": "Launch App",
"description": "Your app description under 130 characters",
"primaryCategory": "social",
"tags": ["tag1", "tag2"]
 }
}
````

## Success Verification

Basic functionality and discovery/sharing checklists: confirm load, images, wallet, manifest endpoint, embed rendering, and search presence.

## Getting Additional Help

- [Base Build Preview Tool](https://base.dev/preview)
- JSONLint
- [Eruda](https://github.com/liriliri/eruda)
- Base Discord — #minikit channel

# Base App Compatibility

> Build Mini Apps with features that work seamlessly across the Base App and Farcaster.

Base App is working towards full compatibility with the Farcaster Mini App SDK. During beta, some features are not yet supported.

## Currently Unsupported

- [`signManifest`(experimental)](https://miniapps.farcaster.xyz/docs/sdk/actions/sign-manifest)

## Base app Mini App SDK Supported Features

- [Quick Auth](https://miniapps.farcaster.xyz/docs/sdk/actions/quick-auth)
- [addMiniApp](https://miniapps.farcaster.xyz/docs/sdk/actions/add-miniapp)
- [close](https://miniapps.farcaster.xyz/docs/sdk/actions/close)
- [composeCast](https://miniapps.farcaster.xyz/docs/sdk/actions/compose-cast)
- [ready](https://miniapps.farcaster.xyz/docs/sdk/actions/ready)
- [openUrl](https://miniapps.farcaster.xyz/docs/sdk/actions/open-url)
- [openMiniApp](https://miniapps.farcaster.xyz/docs/sdk/actions/open-miniapp)
- [signIn](https://miniapps.farcaster.xyz/docs/sdk/actions/sign-in)
- [viewProfile](https://miniapps.farcaster.xyz/docs/sdk/actions/view-profile)
- [viewCast](https://miniapps.farcaster.xyz/docs/sdk/actions/view-cast)
- [swapToken](https://miniapps.farcaster.xyz/docs/sdk/actions/swap-token)
- [sendToken](https://miniapps.farcaster.xyz/docs/sdk/actions/send-token)
- [viewToken](https://miniapps.farcaster.xyz/docs/sdk/actions/view-token)
- [requestCameraAndMicrophoneAccess](https://miniapps.farcaster.xyz/docs/sdk/actions/request-camera-and-microphone-access)
- [Haptics](https://miniapps.farcaster.xyz/docs/sdk/haptics)

## Base App Client Detection

To detect if the app is running in the Base App, you can use the`clientFid`property of the`context`object.

#### Code```tsx

import { useMiniKit } from '@coinbase/onchainkit/minikit';

function MyComponent {
const { context } = useMiniKit;
const isBaseApp = context.client.clientFid === 309857;

if (isBaseApp) {
// Use Base App-specific features
console.log('Running in Base App');
}

return <div>{/_ Your component _/}</div>;
}

````## Supported Chains

* Base
* Mainnet
* Optimism
* Arbitrum
* Polygon
* Zora
* BNB
* Avalanche C‑Chain

We are actively expanding compatibility and will update this page as support increases.


# How Search works

> If your Mini App isn't appearing in the Base app, this guide explains how indexing and search work so you can identify and fix the issue.

Indexing is how The Base app adds your Mini App to its catalog, making it discoverable through search and browsing.
Unlike traditional app stores with manual submission, you control when indexing happens. Share your Mini App URL to the social feed, and indexing starts automatically—no review process required.

## How indexing works

Understanding the indexing process helps you diagnose why your Mini App may not be appearing.

<Note>
 Your manifest must be properly configured and validated for indexing to work. See [manifest documentation](/mini-apps/core-concepts/manifest) for required fields and validation.
</Note>


### Step: Share your Mini App URL
Share your URL to the feed.

### Step: The Base app validates your manifest
The Base app fetches and validates your manifest file.


> Warning:
Invalid or unreachable manifests will fail indexing.


### Step: Your app enters the directory
Your Mini App is recorded and becomes searchable within 10 minutes.

## How search works

The Base App's search queries your Mini App's`name`field from the catalog. Both exact and partial matches appear in results. Search displays your Mini App based on information you provided in your manifest.


<Note>
 When making changes to your manifest, you will need to share your URL to reindex.
</Note>

## Discovery surfaces

### Category browsing

Your app appears in the category specified by`primaryCategory`in your manifest. Users browse categories to discover apps by interest.


<Note>
 **Category rankings**: Rankings use 7-day engagement metrics such as shares.
</Note>

### Saved apps

When users save your Mini App, it appears in their personal saved options for quick access. Prompt users to save at key moments.


### Direct messages

When users share your Mini App URL in a direct message, it displays as an interactive embed. Recipients can preview and open your app directly from the conversation, with`context.location`set to`messaging`so you can customize the experience for shared discovery.

## Related



- [Manifest Configuration](/mini-apps/core-concepts/manifest)



- [Embeds & Previews](/mini-apps/core-concepts/embeds-and-previews)



- [Troubleshooting](/mini-apps/troubleshooting/common-issues)




# Mini App Development Templates

> Ready-to-use templates, tools, and tutorials to accelerate your Mini App development on Base

## GitHub Templates

Production-ready code repositories that you can clone and deploy immediately.



- [Full Mini Demo - MiniKit](https://github.com/base/demos/tree/master/mini-apps/templates/minikit/mini-app-full-demo-minikit)



- [Full Mini Demo - Farcaster sdk](https://github.com/base/demos/tree/master/mini-apps/templates/farcaster-sdk/mini-app-full-demo)



### Full Mini Demo

A comprehensive showcase demonstrating the complete range of mini appcapabilities and Base ecosystem integrations in a single, feature-rich application.

**Key technologies implemented:**

* **Mini App SDK** Complete Mini App SDK integration with all available actions and hooks
* **Complete authentication flow** demonstrations and best practices

<Note>
 This demo serves as the ultimate reference implementation, showcasing every Mini App feature in production-ready code that developers can learn from and adapt.
</Note>

## Getting Started


### Step: Choose your template
Select the template that best matches your Mini App concept and requirements.

### Step: Fork or clone
Use the provided links to fork the interactive templates or clone the GitHub repositories.

### Step: Customize and deploy
Modify the templates to match your specific use case and deploy using your preferred hosting solution.

### More Mini App Resources



- [Viral Mini Apps](/mini-apps/growth/build-viral-mini-apps)



- [Data Driven Growth](/mini-apps/technical-guides/data-driven-growth)



- [Optimize Onboarding](/mini-apps/growth/optimize-onboarding)





# https://docs.base.org/mini-apps/llms-full.txt

## Mini Apps â€” Deep Guide for LLMs

> Mini Apps are socialâ€‘native, instantâ€‘launch web apps that run inside Base App. This guide orients an LLM to MiniKit fundamentals, product capabilities, UX best practices, growth mechanics, and troubleshooting.

### What you can do here
- Scaffold new Mini Apps with MiniKit and integrate existing Next.js apps
- Configure manifests for discovery and client capabilities
- Build socialâ€‘native UX using OnchainKit components
- Plan growth loops (sharing, search, notifications) and optimize onboarding
- Diagnose issues specific to Base App vs. other Farcaster clients

## Minimal Critical Code (MiniKit + OnchainKit wiring)
#### Code```tsx
// MiniKit and OnchainKit often coâ€‘exist in Mini Apps. Keep providers minimal.
import { OnchainKitProvider } from '@coinbase/onchainkit'
import { base } from 'wagmi/chains'

export function Providers(props: { children: React.ReactNode }) {
 return (
<OnchainKitProvider apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY} chain={base}>
 {props.children}
</OnchainKitProvider>
 )
}
```## Navigation (with brief descriptions)

### Introduction
- [Overview](https://docs.base.org/mini-apps/overview) â€” Why Mini Apps

### Quickstart
- [New Apps: Install](https://docs.base.org/mini-apps/quickstart/new-apps/install) â€” Scaffold
- [Existing Apps: Integrate](https://docs.base.org/mini-apps/quickstart/existing-apps/install) â€” Integrate
- [Launch Checklist](https://docs.base.org/mini-apps/quickstart/launch-checklist) â€” Readiness

### Design Guidelines
- [Best Practices](https://docs.base.org/mini-apps/design-ux/best-practices) â€” UX patterns
- [OnchainKit](https://docs.base.org/mini-apps/design-ux/onchainkit) â€” Components

### Growth Playbook
- [Optimize Onboarding](https://docs.base.org/mini-apps/growth/optimize-onboarding) â€” Onboarding
- [Build Viral Mini Apps](https://docs.base.org/mini-apps/growth/build-viral-mini-apps) â€” Viral growth

### Features
- [Overview](https://docs.base.org/mini-apps/features/overview) â€” Feature index
- [Manifest](https://docs.base.org/mini-apps/features/manifest) â€” Manifest
- [Authentication](https://docs.base.org/mini-apps/features/Authentication) â€” Auth
- [Embeds & Previews](https://docs.base.org/mini-apps/core-concepts/embeds-and-previews) â€” Embeds
- [Search & Discovery](https://docs.base.org/mini-apps/troubleshooting/how-search-works) â€” Discovery
- [Sharing & Social Graph](https://docs.base.org/mini-apps/features/sharing-and-social-graph) â€” Sharing
- [Notifications](https://docs.base.org/mini-apps/features/notifications) â€” Notifications
- [Links](https://docs.base.org/mini-apps/features/links) â€” Links

### Troubleshooting
- [Common Issues](https://docs.base.org/mini-apps/troubleshooting/common-issues) â€” Issues
- [Base App Compatibility](https://docs.base.org/mini-apps/troubleshooting/base-app-compatibility) â€” Client behavior

### Technical Reference
- [MiniKit Overview](https://docs.base.org/onchainkit/latest/components/minikit/overview) â€” Overview
- [Provider & Initialization](https://docs.base.org/onchainkit/latest/components/minikit/provider-and-initialization) â€” Provider
- [Hooks](https://docs.base.org/onchainkit/latest/components/minikit/hooks/useMiniKit) â€” Hooks


## Quickstart (excerpts)

Source:`https://docs.base.org/mini-apps/quickstart/new-apps/install`Create a new Mini App with MiniKit:
#### Command```bash
npm create minikit@latest my-mini-app
cd my-mini-app && npm i && npm run dev
```Source:`https://docs.base.org/mini-apps/quickstart/existing-apps/install`Add MiniKit to an existing Next.js app:
#### Command```bash
npm install @coinbase/minikit @coinbase/onchainkit
```## Key Concepts (excerpts)

Source:`https://docs.base.org/mini-apps/overview`- Socialâ€‘native UX: Apps run inside Base App with identity, smart wallet, and sharing builtâ€‘in.
- Manifest: Declare capabilities, intents, and metadata to enable discovery and client features.
 - Source:`https://docs.base.org/mini-apps/features/manifest`- Onboarding: Reduce steps; defer heavy auth until value is shown; prefill from client context.
 - Source:`https://docs.base.org/mini-apps/growth/optimize-onboarding`- Discovery: Optimize for search and featuring by following guidelines.
 - Source:`https://docs.base.org/mini-apps/troubleshooting/how-search-works`## Authentication Best Practices (excerpts)

Sources:
-`https://docs.base.org/mini-apps/features/Authentication`-`https://docs.base.org/mini-apps/growth/optimize-onboarding`- Defer authentication: Let users explore and reach first value before prompting to connect or sign. Gate only when action requires identity, balance, or write access.
- Progressive disclosure: Ask for the minimum capability first (e.g., identity only). Request additional permissions justâ€‘inâ€‘time when a feature needs them.
- Use client context: Prefill known fields (handle, pfp, address) from the client to reduce typing and confusion. Avoid duplicate prompts the client already satisfied.
- Least privilege: Prefer scoped, revocable permissions (e.g., perâ€‘action transaction trays) instead of broad, persistent approvals.
- Clear intent: When prompting to authenticate, state why itâ€™s needed, what will happen, and the benefit. Keep copy short and actionâ€‘oriented.
- Resilience & UX: Provide guest mode where possible; handle declined auth gracefully with alternate paths or readâ€‘only modes.
- Server verification: Verify any signed payloads or tokens serverâ€‘side. Enforce replay protection, expiration, and domain binding.
- Secure webhooks: If using webhooks (e.g., for frame updates), require signature verification and rate limiting; log and alert on failures.

Modes summary (from Authentication):

- SIWF / Quick Auth â€” Social identity with low friction, session via JWT when needed.
 - Create Account users: See a Login Request tray; sign SIWF inâ€‘app with passkey.
 - Connect Account users: Oneâ€‘time deeplink to Farcaster to register an auth address, then seamless inâ€‘app signâ€‘in thereafter.
 - Source:`https://docs.base.org/mini-apps/features/Authentication`- Wallet Auth â€” Uses the inâ€‘app smart wallet. Prefer for persisted sessions only when necessary; do not gate initial exploration behind connect.
 - Pair with transaction trays for clear intent and safe approvals.
 - Source:`https://docs.base.org/mini-apps/features/Authentication`- Context Data â€” Provided by hosts and useful for personalization/analytics, but not cryptographic proof of identity.
 - Treat as hints only; never primary auth. It can be spoofed by nonâ€‘official hosts.
 - Source:`https://docs.base.org/mini-apps/features/Authentication`Hook reference:

- useAuthenticate â€” Returns verified user from SIWF or wallet auth. Use alongside`useMiniKit`context.
 - Source:`https://docs.base.org/onchainkit/latest/components/minikit/hooks/useAuthenticate`Example (hook usage):
#### Code```tsx
import { useMiniKit } from '@coinbase/minikit'
import { useAuthenticate } from '@coinbase/onchainkit/minikit'

export function AuthGate(props: { children: React.ReactNode }) {
 const { context } = useMiniKit
 const { user } = useAuthenticate

 // Use context for UI hints only
 const displayName = context?.user?.displayName ?? 'Friend'

 // Use verified user for secure ops
 if (!user) return <button>Sign in</button>
 return <div aria-live="polite">Welcome, {displayName}!{props.children}</div>
}
```Conceptual serverâ€‘side verification (pseudocode):
#### Code```ts
// Verify a signed payload from the client (conceptual)
function verifyAuth({ address, message, signature }): boolean {
 const recovered = recoverAddress({ message, signature })
 if (!timingSafeEqual(recovered, address)) return false
 if (isExpired(message)) return false
 if (!isExpectedDomain(message.domain)) return false
 return true
}
```Prompt timing guidelines:
- On first open: no auth prompt; show value and CTA.
- On action requiring identity or write: show a single, focused auth step.
- After success: persist session, avoid reâ€‘prompting; provide visible account state.


## API and Schemas (pruned)

- MiniKit Provider and initialization props
 - Source:`https://docs.base.org/onchainkit/latest/components/minikit/provider-and-initialization`-`useMiniKit`hook: access frame context, user, and client capabilities
 - Source:`https://docs.base.org/onchainkit/latest/components/minikit/hooks/useMiniKit`Example manifest fields (conceptual):
#### JSON```json
{
 "accountAssociation": {
"header": "eyJmaWQiOjkxNTIsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHgwMmVmNzkwRGQ3OTkzQTM1ZkQ4NDdDMDUzRURkQUU5NDBEMDU1NTk2In0",
"payload": "eyJkb21haW4iOiJhcHAuZXhhbXBsZS5jb20ifQ",
"signature": "MHgxMGQwZGU4ZGYwZDUwZTdmMGIxN2YxMTU2NDI1MjRmZTY0MTUyZGU4ZGU1MWU0MThiYjU4ZjVmZmQxYjRjNDBiNGVlZTRhNDcwNmVmNjhlMzQ0ZGQ5MDBkYmQyMmNlMmVlZGY5ZGQ0N2JlNWRmNzMwYzUxNjE4OWVjZDJjY2Y0MDFj"
 },
 "baseBuilder": {
"ownerAddress": "0x..."
 },
 "frame": {
"version": "1",
"name": "Example Mini App",
"homeUrl": "https://ex.co
"iconUrl": "https://ex.co/i.png
"splashImageUrl": "https://ex.co/l.png
"splashBackgroundColor": "#000000",
"webhookUrl": "https://ex.co/api/webhook
"subtitle": "Fast, fun, social",
"description": "A fast, fun way to challenge friends in real time.",
"screenshotUrls": [
 "https://ex.co/s1.png
 "https://ex.co/s2.png
 "https://ex.co/s3.png
],
"primaryCategory": "social",
"tags": ["example", "miniapp", "baseapp"],
"heroImageUrl": "https://ex.co/og.png
"tagline": "Play instantly",
"ogTitle": "Example Mini App",
"ogDescription": "Challenge friends in real time.",
"ogImageUrl": "https://ex.co/og.png
"noindex": true
 }
}
```## Examples (common flows)

Example: Wire providers for OnchainKit + MiniKit

Sources:
-`https://docs.base.org/mini-apps/design-ux/onchainkit`-`https://docs.base.org/onchainkit/latest/components/minikit/provider-and-initialization`#### Code```tsx
import { OnchainKitProvider } from '@coinbase/onchainkit'
import { base } from 'wagmi/chains'

export function Providers(props: { children: React.ReactNode }) {
 return (
<OnchainKitProvider apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY} chain={base}>
 {props.children}
</OnchainKitProvider>
 )
}
```Example: Use`useMiniKit`to access client context

Source:`https://docs.base.org/onchainkit/latest/components/minikit/hooks/useMiniKit`#### Code```tsx
import { useMiniKit } from '@coinbase/minikit'

export function Screen {
 const { user, client } = useMiniKit
 return <pre>{JSON.stringify({ user, client }, null, 2)}</pre>
}
```BASE ACCOUNT
## Introduction

# Base Account Overview

> What is a Base Account and how the Base Account SDK lets you add universal sign-in and one-tap USDC payments to any app.

> **TL;DR** – Base Accounts are the onchain identity and account layer powering the [Base App](https://base.app With the **Base Account SDK** you can connect to over one hundred thousand users and unlock authentication and payments with just a few lines of code.

## What is a Base Account?

A Base Account is a Smart-Wallet–backed account that gives every user:

* **Universal sign-on** – one passkey works across every Base-enabled app.
* **One-tap payments** – low-friction USDC payments built into the account layer.
* **Private profile vault** – opt-in sharing of email, phone, shipping address, and more.
* **Multi-chain support** – one address that works across nine EVM networks (and counting).

> Under the hood, each Base Account is an ERC-4337 Smart Wallet that can be deployed on any EVM-compatible chain; nine EVM mainnet chains are enabled out of the box, including Base Mainnet.

<Note>
 **Supported networks**

 * **Mainnet:** Base • Arbitrum • Optimism • Zora • Polygon • BNB • Avalanche • Lordchain • Ethereum Mainnet (not recommended due to costs)
 * **Testnet:** Sepolia • Base Sepolia
</Note>

## Why should developers care?

* **Higher conversion** – no app installs, seed phrases, or network switches.
* **Fewer drop-offs at checkout** – a single`pay`call handles gas and settlement.
* **Cross-app identity** – fetch a verified email or shipping address via the same SDK.
* **Self-custodial** – users hold the keys; you never touch private data or funds.

## Next steps

| Goal | Start here |
| ---------------------------- | -------------------------------------------------------------------- |
| Build & run in 5 min | [Quickstart](/base-account/quickstart/web) |
| Authentication flow | [Authenticate users](/base-account/guides/authenticate-users) |
| Accept USDC payments on Base | [Accept payments](/base-account/guides/accept-payments) |
| Deep-dive API shapes | [TypeScript API reference](/base-account/reference/core/getProvider) |


Quickstart:

# Web (HTML + JS)

> Integrate Sign in with Base and Base Pay using nothing but HTML and JavaScript.

This quick-start shows the **minimum** code required to add Sign in with Base and Base Pay to any web page using nothing but the Base Account SDK. No frameworks, no additional libraries.

## 1. Install the SDK (Optional)

<Note>
 **Interactive Playground:** Want to test the SDK functions before integrating? Try our [Base Pay SDK Playground](https://base.github.io/account-sdk/pay-playground) to experiment with`pay`and`getPaymentStatus`functions.
</Note>

You can use the Base Account SDK in two ways:

### Option A: CDN (No installation required)

Just include the script tag in your HTML - no build tools needed!
#### Code```html
[...rest of your code]
<script src="https://unpkg.com/@base-org/account/dist/base-account.min.js></script>
[...rest of your code]
```For a full example, see [example](#2-copy-paste-this-html-file) below.

### Option B: NPM Package

If you prefer to install locally:

<CodeGroup>
#### Command```bash
 npm install @base-org/account
```#### Command```bash
 pnpm add @base-org/account
```#### Command```bash
 yarn add @base-org/account
```#### Command```bash
 bun add @base-org/account
```</CodeGroup>

Then use ES modules:
#### Code```html
<script type="module">
 import { createBaseAccountSDK, pay, getPaymentStatus } from "@base-org/account";
 // ... rest of your code
</script>
```This guide uses the CDN approach for simplicity.

## 2. Copy-paste this HTML file
#### Code```html
<!doctype html>
<html>
 <head>
<meta charset="utf-8" />
<title>Base Account Quick-start</title>
 </head>
 <body>
<h1>Base Account Demo</h1>

<button id="signin">Sign in with Base</button>
<button id="pay">Pay with Base</button>

<div id="status"></div>

<!-- Load Base Account SDK via CDN -->
<script src="https://unpkg.com/@base-org/account/dist/base-account.min.js></script>

<script>
 // Initialize Base Account SDK with app configuration
 const provider = window.createBaseAccountSDK({
appName: 'Base Account Quick-start'
 }).getProvider;
 const statusDiv = document.getElementById("status");
 let userAddress = null;

 function showStatus(message, type = 'success') {
statusDiv.innerHTML = message;
 }

 // Generate a fresh nonce for authentication
 function generateNonce {
return window.crypto.randomUUID.replace(/-/g, '');
 }

 // Sign in with Base using wallet_connect method
 document.getElementById("signin").onclick = async => {
try {
 showStatus("Connecting to Base Account...", 'success');

 // Generate a fresh nonce
 const nonce = generateNonce;

 // Connect and authenticate using the new wallet_connect method
 const { accounts } = await provider.request({
method: 'wallet_connect',
params: [{
 version: '1',
 capabilities: {
 signInWithEthereum: {
 nonce,
 chainId: '0x2105' // Base Mainnet - 8453
 }
 }
}]
 });

 const { address } = accounts[0];
 const { message, signature } = accounts[0].capabilities.signInWithEthereum;

 userAddress = address;

 showStatus(`✅ Successfully signed in! Address: ${address.slice(0, 6)}...${address.slice(-4)}`);

 // In a real app, you would send the message and signature to your backend for verification
 console.log('Authentication data:', { address, message, signature });

} catch (error) {
 console.error('Sign-in error:', error);
 showStatus(`❌ Sign-in failed: ${error.message}`, 'error');
}
 };

 // One-tap USDC payment using window.base API (works with or without sign-in)
 document.getElementById("pay").onclick = async => {
try {
 showStatus("Processing payment...", 'success');

 const result = await window.base.pay({
amount: "5.00", // USD – SDK quotes equivalent USDC
to: "0x2211d1D0020DAEA8039E46Cf1367962070d77DA9",
testnet: true // set to false or omit for Mainnet
 });

 const status = await window.base.getPaymentStatus({
id: result.id,
testnet: true
 });

 showStatus(`🎉 Payment completed! Status: ${status.status}`);
} catch (error) {
 showStatus(`❌ Payment failed: ${error.message}`, 'error');
}
 };
</script>
 </body>
</html>
```## 3. Serve the file

Any static server will work:
#### Command```bash
npx serve .
# or
python -m http.server
```Open http://localhost:3000, click **Sign in with Base** (optional) and then **Pay with Base**, approve the transaction, and you've sent 5 USDC on Base Sepolia—done! 🎉

## Next steps

* **[Add Sign In With Base Button](/base-account/reference/ui-elements/sign-in-with-base-button)** – implement full SIWE authentication with backend verification
* **[Add Base Pay Button](/base-account/reference/ui-elements/base-pay-button)** – collect user information during payment flow


> Warning:
**Please Follow the Brand Guidelines**

 If you intend on using the`SignInWithBaseButton`or`BasePayButton`, please follow the [Brand Guidelines](/base-account/reference/ui-elements/brand-guidelines) to ensure consistency across your application.

# Web (Next.js)

> Quickly add Sign in with Base and Base Pay to any Next.js app

export const GithubRepoCard = ({title, githubUrl}) => {
 return <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="mb-4 flex items-center rounded-lg bg-zinc-900 p-4 text-white transition-all hover:bg-zinc-800">
 <div className="flex w-full items-center gap-3">
 <svg height="24" width="24" className="flex-shrink-0 dark:fill-white" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg>
 <path fill="currentColor" fillRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
 </svg>

 <div className="flex min-w-0 flex-grow flex-col">
 <span className="truncate text-base font-medium">{title}</span>
 <span className="truncate text-xs text-zinc-400">{githubUrl}</span>
 </div>

 <svg className="h-5 w-5 flex-shrink-0 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
 </svg>
 </div>
 </a>;
};

This quick-start shows the **minimum** code required to add Sign in with Base (SIWB) and Base Pay to any Next.js app using the Base Account SDK.

## 1. Create a new Next.js app

If you're starting fresh, create a new Next.js app:

<CodeGroup>
#### Command
```bash
 npx create-next-app@latest base-account-quickstart
 cd base-account-quickstart
```#### Command```bash
 yarn create next-app base-account-quickstart
 cd base-account-quickstart
```#### Command```bash
 pnpm create next-app base-account-quickstart
 cd base-account-quickstart
```#### Command```bash
 bunx create-next-app base-account-quickstart
 cd base-account-quickstart
```</CodeGroup>

When prompted during setup, you can choose the default options or customize as needed. For this quickstart, the default settings work perfectly.

## 2. Install the SDK

<CodeGroup>
#### Command```bash
 npm install @base-org/account @base-org/account-ui
```#### Command```bash
 pnpm add @base-org/account @base-org/account-ui
```#### Command```bash
 yarn add @base-org/account @base-org/account-ui
```#### Command```bash
 bun add @base-org/account @base-org/account-ui
```</CodeGroup>


> Note:
**Got a peer dependency error?**

 Use`--legacy-peer-deps`flag if you get a peer dependency error.

## 3. Create the main component

Replace the contents of`app/page.tsx`(or`app/page.js`if not using TypeScript) with this component:
#### Code```jsx
'use client';

import React, { useState } from 'react';
import { createBaseAccountSDK, pay, getPaymentStatus } from '@base-org/account';
import { SignInWithBaseButton, BasePayButton } from '@base-org/account-ui/react';

export default function Home {
 const [isSignedIn, setIsSignedIn] = useState(false);
 const [paymentStatus, setPaymentStatus] = useState('');
 const [paymentId, setPaymentId] = useState('');
 const [theme, setTheme] = useState('light');

 // Initialize SDK
 const sdk = createBaseAccountSDK(
{
 appName: 'Base Account Quick-start'
}
 );

 // Optional sign-in step – not required for `pay`, but useful to get the user address
 const handleSignIn = async => {
try {
 await sdk.getProvider.request({ method: 'wallet_connect' });
 setIsSignedIn(true);
} catch (error) {
 console.error('Sign in failed:', error);
}
 };

 // One-tap USDC payment using the pay function
 const handlePayment = async => {
try {
 const { id } = await pay({
amount: '0.01', // USD – SDK quotes equivalent USDC
to: '0xRecipientAddress', // Replace with your recipient address
testnet: true // set to false or omit for Mainnet
 });

 setPaymentId(id);
 setPaymentStatus('Payment initiated! Click "Check Status" to see the result.');
} catch (error) {
 console.error('Payment failed:', error);
 setPaymentStatus('Payment failed');
}
 };

 // Check payment status using stored payment ID
 const handleCheckStatus = async => {
if (!paymentId) {
 setPaymentStatus('No payment ID found. Please make a payment first.');
 return;
}

try {
 const { status } = await getPaymentStatus({ id: paymentId });
 setPaymentStatus(`Payment status: ${status}`);
} catch (error) {
 console.error('Status check failed:', error);
 setPaymentStatus('Status check failed');
}
 };

 const toggleTheme = => {
setTheme(theme === 'light' ? 'dark' : 'light');
 };

 const dark = theme === 'dark';
 const styles = {
container: { minHeight: '100vh', backgroundColor: dark ? '#111' : '#fff', color: dark ? '#fff' : '#000', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' },
card: { backgroundColor: dark ? '#222' : '#f9f9f9', borderRadius: '12px', padding: '30px', maxWidth: '400px', textAlign: 'center' },
title: { fontSize: '24px', fontWeight: 'bold', marginBottom: '10px', color: dark ? '#fff' : '#00f' },
subtitle: { fontSize: '16px', color: dark ? '#aaa' : '#666', marginBottom: '30px' },
themeToggle: { position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' },
buttonGroup: { display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' },
status: { marginTop: '20px', padding: '12px', backgroundColor: dark ? '#333' : '#f0f0f0', borderRadius: '8px', fontSize: '14px' },
signInStatus: { marginTop: '8px', fontSize: '14px', color: dark ? '#0f0' : '#060' }
 };

 return (
<div style={styles.container}>
 <button onClick={toggleTheme} style={styles.themeToggle}>
{theme === 'light' ? '🌙' : '☀️'}
 </button>

 <div style={styles.card}>
<h1 style={styles.title}>Base Account</h1>
<p style={styles.subtitle}>Experience seamless crypto payments</p>

<div style={styles.buttonGroup}>
 <SignInWithBaseButton
align="center"
variant="solid"
colorScheme={theme}
size="medium"
onClick={handleSignIn}
 />

 {isSignedIn && (
<div style={styles.signInStatus}>
 ✅ Connected to Base Account
</div>
 )}

 <BasePayButton
colorScheme={theme}
onClick={handlePayment}
 />

 {paymentId && (
<button
 onClick={handleCheckStatus}
 style={{
 padding: '12px 24px',
 backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6',
 color: theme === 'dark' ? '#ffffff' : '#1f2937',
 border: `1px solid ${theme === 'dark' ? '#6b7280' : '#d1d5db'}`,
 borderRadius: '8px',
 cursor: 'pointer',
 fontSize: '14px'
 }}
>
 Check Payment Status
</button>
 )}
</div>

{paymentStatus && (
 <div style={styles.status}>
{paymentStatus}
 </div>
)}
 </div>
</div>
 );
}
```<Note>
 **Note:**

 Make sure to replace`0xRecipientAddress`with your recipient address.
</Note>


> Note:
**Base Pay and SIWB are independent**

 You DO NOT need to use SIWB to use Base Pay. You can just call the`pay`function without any additional setup.

## 4. Start your app
#### Command```bash
npm run dev
````

Open http://localhost:3000, click **Sign in with Base** (optional) and then **Pay**, approve the transaction, and you've sent 5 USDC on Base Sepolia—done! 🎉

**Note:** If you have an existing Next.js app, just install the SDK (`npm install @base-org/account @base-org/account-ui`) and add the component above to your project. For other React frameworks, you can adapt this component as needed.

## Next steps

- **[Authenticate Users](/base-account/guides/authenticate-users)** - strong authentication by setting up Sign in with Base with backend verification
- **[Accept Payments](/base-account/guides/accept-payments)** explore all the features of Base Pay
- **[Sign in with Base Button](/base-account/reference/ui-elements/sign-in-with-base-button)** – use the Sign in with Base Button component to quickly add authentication to your app
- **[Base Pay Button](/base-account/reference/ui-elements/base-pay-button)** – use the Base Pay Button component to quickly add payments to your app

> Warning:
> **Please Follow the Brand Guidelines**

If you intend on using the `SignInWithBaseButton`or`BasePayButton`, please follow the [Brand Guidelines](/base-account/reference/ui-elements/brand-guidelines) to ensure consistency across your application.

# Mobile (React Native)

export const GithubRepoCard = ({title, githubUrl}) => {
return <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="mb-4 flex items-center rounded-lg bg-zinc-900 p-4 text-white transition-all hover:bg-zinc-800">

 <div className="flex w-full items-center gap-3">
 <svg height="24" width="24" className="flex-shrink-0 dark:fill-white" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg>
 <path fill="currentColor" fillRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
 </svg>

 <div className="flex min-w-0 flex-grow flex-col">
 <span className="truncate text-base font-medium">{title}</span>
 <span className="truncate text-xs text-zinc-400">{githubUrl}</span>
 </div>

 <svg className="h-5 w-5 flex-shrink-0 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
 </svg>
 </div>
 </a>;
};

export const Danger = ({children}) => {
return <div class="my-4 px-5 py-4 overflow-hidden rounded-2xl flex gap-3 border danger-admonition dark:danger-admonition">

 <div class="mt-0.5 w-4">
 <svg width="14" height="14" viewBox="0 0 14 14" fill="rgb(239, 68, 68)" xmlns="http://www.w3.org/2000/svg class="w-4 h-4 text-sky-500" aria-label="Danger">
 <path fill-rule="evenodd" clip-rule="evenodd" d="M7 1.3C10.14 1.3 12.7 3.86 12.7 7C12.7 10.14 10.14 12.7 7 12.7C5.48908 12.6974 4.0408 12.096 2.97241 11.0276C1.90403 9.9592 1.30264 8.51092 1.3 7C1.3 3.86 3.86 1.3 7 1.3ZM7 0C3.14 0 0 3.14 0 7C0 10.86 3.14 14 7 14C10.86 14 14 10.86 14 7C14 3.14 10.86 0 7 0ZM8 3H6V8H8V3ZM8 9H6V11H8V9Z"></path>
 </svg>
 </div>
 <div class="text-sm prose min-w-0">
 {children}
 </div>
 </div>;
};

This guide helps you add support for Base Account into a React Native app
by integrating the
[Mobile Wallet Protocol Client](https://www.npmjs.com/package/@mobile-wallet-protocol/client)

<Note>
 This doc is updated for Mobile Wallet Protocol Client `v1.0.0`</Note>

<Danger>
 **Deep Link Handling**

Breaking change in v1.0.0: Universal Links and App Links requirements are
removed in favor of custom schemes (e.g.`myapp://`).
</Danger>

## Before You Start

This guide walks you through adding support for Base Account into an existing React Native app or starter project.

If you prefer to skip ahead and start with a working example, navigate to the repository below:

<GithubRepoCard title="Mobile Wallet Protocol Expo Example" githubUrl="https://github.com/MobileWalletProtocol/smart-wallet-expo-example />

If you are looking to integrate Base Account into an existing React Native app or starter project, follow the instructions below.

## Step 1: Install Mobile Wallet Protocol Client

Add the latest version of [Mobile Wallet Protocol Client](https://mobilewalletprotocol.github.io/wallet-mobile-sdk/) to your project.

<CodeGroup>
```zsh
 npm i @mobile-wallet-protocol/client@latest
```
```zsh
 yarn add @mobile-wallet-protocol/client@latest
```</CodeGroup>

## Step 2: Add Polyfills

### Install peer dependencies

The Mobile Wallet Protocol Client library requires the [Expo WebBrowser](https://docs.expo.dev/versions/latest/sdk/webbrowser/) and [Async Storage](https://react-native-async-storage.github.io/async-storage/docs/install) packages to be installed.
Follow the instructions on the respective pages for any additional setup.

<CodeGroup>```zsh
npm i expo expo-web-browser @react-native-async-storage/async-storage

````
```zsh
 yarn add expo expo-web-browser @react-native-async-storage/async-storage
```</CodeGroup>

### Polyfills

Mobile Wallet Protocol Client requires`crypto.randomUUID`, `crypto.getRandomValues`, and `URL`to be polyfilled globally since they are not available in the React Native environment.

Below is an example of how to polyfill these functions in your app using the [expo-crypto](https://docs.expo.dev/versions/latest/sdk/crypto/) and [expo-standard-web-crypto](https://github.com/expo/expo/tree/master/packages/expo-standard-web-crypto/) packages.

<CodeGroup>```zsh
 npm i expo-crypto expo-standard-web-crypto react-native-url-polyfill
````

````zsh
 yarn add expo-crypto expo-standard-web-crypto react-native-url-polyfill
```</CodeGroup>

<CodeGroup>
#### Code```js
 import "react-native-url-polyfill/auto";
 import { polyfillWebCrypto } from "expo-standard-web-crypto";
 import { randomUUID } from "expo-crypto";

 polyfillWebCrypto;
 crypto.randomUUID = randomUUID;
```#### Code```tsx
 import "./polyfills"; // import before @mobile-wallet-protocol/client

 import { CoinbaseWalletSDK } from "@mobile-wallet-protocol/client";

 /// ...
```</CodeGroup>

## Step 3: Usage

Mobile Wallet Protocol Client provides 2 interfaces for mobile app to interact with the Base Account, an EIP-1193 compliant provider interface and a wagmi connector.

<Check>
 If your app is using wallet aggregator, go straight to [**Option 2: Wagmi
 Connector**](#option-2-wagmi-connector) for 1-line integration.
</Check>

### Option 1: EIP-1193 Provider


> Warning:
The`app`prefix in SDK config params is removed in v1.0.0.

Create a new`EIP1193Provider`instance, which is EIP-1193 compliant.
#### Code```tsx
import { EIP1193Provider } from "@mobile-wallet-protocol/client";

// Step 1. Initialize provider with your dapp's metadata and target wallet
const metadata = {
 name: "My App Name",
 customScheme: "myapp://", // only custom scheme (e.g. `myapp://`) is supported in v1.0.0
 chainIds: [8453],
 logoUrl: "https://example.com/logo.png
};
const provider = new EIP1193Provider({
 metadata,
 wallet: Wallets.CoinbaseSmartWallet,
});

// ...

// 2. Use the provider
const addresses = await provider.request({ method: "eth_requestAccounts" });
const signedData = await provider.request({
 method: "personal_sign",
 params: ["0x48656c6c6f20776f726c6421", addresses[0]],
});
```### Option 2: Wagmi Connector

Add the latest version of Mobile Wallet Protocol wagmi-connectors to your project.

<CodeGroup>```zsh
 npm i @mobile-wallet-protocol/wagmi-connectors@latest
````

````zsh
 yarn add @mobile-wallet-protocol/wagmi-connectors@latest
```</CodeGroup>

Simply import the`createConnectorFromWallet`function and pass in the wallet you want to use to wagmi config.
#### Code```ts
import {
 createConnectorFromWallet,
 Wallets,
} from "@mobile-wallet-protocol/wagmi-connectors";

const metadata = {
 name: "My App Name",
 customScheme: "myapp://", // only custom scheme (e.g. `myapp://`) is supported in v1.0.0
 chainIds: [8453],
 logoUrl: "https://example.com/logo.png
};

export const config = createConfig({
 chains: [base],
 connectors: [
createConnectorFromWallet({
 metadata,
 wallet: Wallets.CoinbaseSmartWallet,
}),
 ],
 transports: {
[base.id]: http,
 },
});
```Then you can use wagmi's react interface to interact with the Base Account.
#### Code```tsx
import { useConnect } from "wagmi";

// ...

const { connect, connectors } = useConnect;

return (
 <Button
title={"Connect"}
onPress={ => {
 connect({ connector: connectors[0] });
}}
 />
);
```## Give feedback!

Send us feedback on the Base Discord or create a new issue on the [MobileWalletProtocol/react-native-client](https://github.com/MobileWalletProtocol/react-native-client/issues) repository.


## Guides

# Authenticate Users

> Let a user click “Sign in with Base,” prove ownership of their onchain account, and give your server everything it needs to create a session – using open standards and no passwords

export const SignInWithBaseButton = ({colorScheme = 'light'}) => {
 const isLight = colorScheme === 'light';
 return <button type="button" style={{
 display: 'flex',
 alignItems: 'center',
 justifyContent: 'center',
 gap: '8px',
 padding: '12px 16px',
 backgroundColor: isLight ? '#ffffff' : '#000000',
 border: 'none',
 borderRadius: '8px',
 cursor: 'pointer',
 fontFamily: 'system-ui, -apple-system, sans-serif',
 fontSize: '14px',
 fontWeight: '500',
 color: isLight ? '#000000' : '#ffffff',
 minWidth: '180px',
 height: '44px'
 }}>
 <div style={{
 width: '16px',
 height: '16px',
 backgroundColor: isLight ? '#0000FF' : '#FFFFFF',
 borderRadius: '2px',
 flexShrink: 0
 }} />
 <span>Sign in with Base</span>
 </button>;
};

export const BasePayButton = ({colorScheme = 'light'}) => {
 const isLight = colorScheme === 'light';
 return <button type="button" style={{
 display: 'flex',
 alignItems: 'center',
 justifyContent: 'center',
 padding: '12px 16px',
 backgroundColor: isLight ? '#ffffff' : '#0000FF',
 border: 'none',
 borderRadius: '8px',
 cursor: 'pointer',
 fontFamily: 'system-ui, -apple-system, sans-serif',
 minWidth: '180px',
 height: '44px'
 }}>
 <img src={isLight ? '/images/base-account/BasePayBlueLogo.png' : '/images/base-account/BasePayWhiteLogo.png'} alt="Base Pay" style={{
 height: '20px',
 width: 'auto'
 }} />
 </button>;
};

## Why wallet signatures instead of passwords?

1. **No new passwords** – authentication happens with the key the user already controls.
2. **Nothing to steal or reuse** – each login is a one-off, domain-bound signature that never leaves the user’s device.
3. **Wallet-agnostic** – works in any EIP-1193 wallet (browser extension, mobile deep-link, embedded provider) and follows the open ["Sign in with Ethereum" (SIWE) EIP-4361](https://eips.ethereum.org/EIPS/eip-4361) standard.

Base Accounts build on those standards so you can reuse any SIWE tooling – while still benefiting from passkeys, session keys, and smart-wallet security.


> Warning:
**Please Follow the Brand Guidelines**

 If you intend on using the`SignInWithBaseButton`, please follow the [Brand Guidelines](/base-account/reference/ui-elements/brand-guidelines) to ensure consistency across your application.

## High-level flow
```mermaid
sequenceDiagram
participant User
participant Browser
participant AppServer as "App Server"
participant SDK
participant Account

alt Generate locally
Browser->>Browser: randomNonce
else Prefetch
Browser->>AppServer: GET /auth/nonce (on page load)
AppServer-->>Browser: nonce
end

User->>Browser: Click "Sign in with Base"
Browser->>SDK: wallet_connect(signInWithEthereum {nonce})
SDK->>Account: wallet_connect(...)
User->>Account: Approve connection
Account-->>SDK: {address, message, signature}
SDK-->>Browser: {address, message, signature}

Browser-->>AppServer: POST /auth/verify {address, message, signature}
AppServer-->>Browser: session token / JWT
```<Note type="info">
 **Undeployed Smart Wallets?** <br /> Base Account signatures include the <a href="https://eips.ethereum.org/EIPS/eip-6492 target="_blank">ERC-6492</a> wrapper so they can be verified even before the wallet contract is deployed. Viem’s`verifyMessage`and`verifyTypedData`handle this automatically.
</Note>

## Implementation

### Install Dependencies

Make sure to install the dependencies:

<CodeGroup>
#### Command```bash
 npm install @base-org/account @base-org/account-ui
```#### Command```bash
 pnpm add @base-org/account @base-org/account-ui
```#### Command```bash
 yarn add @base-org/account @base-org/account-ui
```#### Command```bash
 bun add @base-org/account @base-org/account-ui
```</CodeGroup>

### Code Snippets

<CodeGroup>
#### Code```ts
 import { createBaseAccountSDK } from "@base-org/account";
 import crypto from 'crypto';

 // Initialize the SDK
 const provider = createBaseAccountSDK({appName: 'My App'}).getProvider;

 // 1 — get a fresh nonce (generate locally or prefetch from backend)
 const nonce = window.crypto.randomUUID.replace(/-/g, '');
 // OR prefetch from server
 // const nonce = await fetch('/auth/nonce').then(r => r.text);

 // 2 — switch to Base Chain
 const switchChainResponse = await provider.request({
 method: "wallet_switchEthereumChain",
 params: [{ chainId: '0x2105' }],
})

console.log('Switch chain response:', switchChainResponse);

 // 3 — connect and authenticate
 try {
const { accounts } = await provider.request({
 method: 'wallet_connect',
 params: [{
version: '1',
capabilities: {
 signInWithEthereum: {
nonce,
chainId: '0x2105' // Base Mainnet - 8453
 }
}
 }]
});
const { address } = accounts[0];
const { message, signature } = accounts[0].capabilities.signInWithEthereum;
await fetch('/auth/verify', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ address, message, signature })
});
 } catch (err) {
console.error(`err ${err}`);
 }
```#### Code```ts
 import { createPublicClient, http } from 'viem';
 import { base } from 'viem/chains';

 const client = createPublicClient({ chain: base, transport: http });

 export async function verifySig(req, res) {
const { address, message, signature } = req.body;
const valid = await client.verifyMessage({ address, message, signature });
if (!valid) return res.status(401).json({ error: 'Invalid signature' });
// create session / JWT
res.json({ ok: true });
 }
```</CodeGroup>

<Note type="tip">
 If using the above code beyond Base Account, note that not every wallet supports the new [<code>wallet\_connect</code> method](/base-account/reference/core/provider-rpc-methods/wallet_connect) yet. If the call throws \[<code>method\_not\_supported</code>], fall back to using <code>eth\_requestAccounts</code> and <code>personal\_sign</code>.
</Note>

<Note type="tip">
 To avoid [popup blockers](/base-account/more/troubleshooting/usage-details/popups#default-blocking-behavior), fetch or generate the nonce <strong>before</strong> the user presses "Sign in with Base" (for example on page load). For security, the only requirement is that your backend keeps track of every nonce and refuses any that are reused – regardless of where it originated.
</Note>

### Example Express Server
#### Code```ts
import crypto from 'crypto';
import express from 'express';
import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';

const app = express;
app.use(express.json);

// Simple in-memory nonce store (swap for Redis or DB in production)
const nonces = new Set<string>;

app.get('/auth/nonce', (_, res) => {
 const nonce = crypto.randomBytes(16).toString('hex');
 nonces.add(nonce);
 res.send(nonce);
});

const client = createPublicClient({ chain: base, transport: http });

app.post('/auth/verify', async (req, res) => {
 const { address, message, signature } = req.body;

 // 1. Check nonce hasn\'t been reused
 const nonce = message.match(/at (\w{32})$/)?.[1];
 if (!nonce || !nonces.delete(nonce)) {
return res.status(400).json({ error: 'Invalid or reused nonce' });
 }

 // 2. Verify signature
 const valid = await client.verifyMessage({ address, message, signature });
 if (!valid) return res.status(401).json({ error: 'Invalid signature' });

 // 3. Create session / JWT here
 res.json({ ok: true });
});

app.listen(3001, => console.log('Auth server listening on :3001'));
```## Add the Base Sign In With Base Button

Use the pre-built component for a native look-and-feel:
#### Code```tsx
import { SignInWithBaseButton } from '@base-org/account-ui/react';

export function App {
 return (
<SignInWithBaseButton
 colorScheme="light"
 onClick={ => signInWithBase}
/>
 );
}
```See full props and theming options in the [Button Reference](/base-account/reference/ui-elements/sign-in-with-base-button) and [Brand Guidelines](/base-account/reference/ui-elements/brand-guidelines).


> Warning:
**Please Follow the Brand Guidelines**

 If you intend on using the`SignInWithBaseButton`, please follow the [Brand Guidelines](/base-account/reference/ui-elements/brand-guidelines) to ensure consistency across your application.

# Accept Payments

> Add one-tap USDC payments to your app with the pay helper and Base Pay Button.

export const SignInWithBaseButton = ({colorScheme = 'light'}) => {
 const isLight = colorScheme === 'light';
 return <button type="button" style={{
 display: 'flex',
 alignItems: 'center',
 justifyContent: 'center',
 gap: '8px',
 padding: '12px 16px',
 backgroundColor: isLight ? '#ffffff' : '#000000',
 border: 'none',
 borderRadius: '8px',
 cursor: 'pointer',
 fontFamily: 'system-ui, -apple-system, sans-serif',
 fontSize: '14px',
 fontWeight: '500',
 color: isLight ? '#000000' : '#ffffff',
 minWidth: '180px',
 height: '44px'
 }}>
 <div style={{
 width: '16px',
 height: '16px',
 backgroundColor: isLight ? '#0000FF' : '#FFFFFF',
 borderRadius: '2px',
 flexShrink: 0
 }} />
 <span>Sign in with Base</span>
 </button>;
};

export const BasePayButton = ({colorScheme = 'light'}) => {
 const isLight = colorScheme === 'light';
 return <button type="button" style={{
 display: 'flex',
 alignItems: 'center',
 justifyContent: 'center',
 padding: '12px 16px',
 backgroundColor: isLight ? '#ffffff' : '#0000FF',
 border: 'none',
 borderRadius: '8px',
 cursor: 'pointer',
 fontFamily: 'system-ui, -apple-system, sans-serif',
 minWidth: '180px',
 height: '44px'
 }}>
 <img src={isLight ? '/images/base-account/BasePayBlueLogo.png' : '/images/base-account/BasePayWhiteLogo.png'} alt="Base Pay" style={{
 height: '20px',
 width: 'auto'
 }} />
 </button>;
};

## Why Base Pay?

USDC on Base is a fully-backed digital dollar that settles in seconds and costs pennies in gas. Base Pay lets you accept those dollars with a single click—no cards, no FX fees, no chargebacks.

* **Any user can pay** – works with every Base Account (smart-wallet) out of the box.
* **USDC, not gas** – you charge in dollars; gas sponsorship is handled automatically.
* **Fast** – most payments confirm in \<2 seconds on Base.
* **Funded accounts** – users pay with USDC from their Base Account or Coinbase Account.
* **No extra fees** – you receive the full amount.


> Warning:
**Please Follow the Brand Guidelines**

 If you intend on using the BasePayButton, please follow the [Brand Guidelines](/base-account/reference/ui-elements/brand-guidelines) to ensure consistency across your application.

## Client-side (Browser SDK)

<Note>
 **Interactive Playground:** Try out the `pay`and`getPaymentStatus`functions in our [Base Pay SDK Playground](https://base.github.io/account-sdk/pay-playground) before integrating them into your app.
</Note>
#### Code```ts

import { pay, getPaymentStatus } from '@base-org/account';

// Trigger a payment – user will see a popup from their wallet service
try {
 const payment = await pay({
amount: '1.00', // USD amount (USDC used internally)
to: '0xRecipient', // your address
testnet: true // set false for Mainnet
 });

 // Option 1: Poll until mined
 const { status } = await getPaymentStatus({
id: payment.id,
testnet: true // MUST match the testnet setting used in pay
 });
 if (status === 'completed') console.log('🎉 payment settled');

} catch (error) {
 console.error(`Payment failed: ${error.message}`);
}
```<Note>
 **Important:** The`testnet`parameter in`getPaymentStatus`must match the value used in the original`pay`call. If you initiated a payment on testnet with`testnet: true`, you must also pass `testnet: true`when checking its status.
</Note>

This is what the user will see when prompted to pay:

<div style={{ display: 'flex', justifyContent: 'center'}}>
 ![](https://mintcdn.com/base-a060aa97/zJDlWs-ElgNXh0g7/images/base-account/BasePayFinal.gif?s=6a9fd90b2c29673b7ede1a2d0d089f65)
</div>

### Collect user information (optional)

Need an email, phone, or shipping address at checkout? Pass a <code>payerInfo</code> object:
#### Code```ts
try {
 const payment = await pay({
amount: '25.00',
to: '0xRecipient',
payerInfo: {
 requests: [
{ type: 'email' },
{ type: 'phoneNumber', optional: true },
{ type: 'physicalAddress', optional: true }
 ],
 callbackURL: 'https://your-api.com/validate // Optional - for server-side validation
}
 });

 console.log(`Payment sent! Transaction ID: ${payment.id}`);

 // Log the collected user information
 if (payment.payerInfoResponses) {
if (payment.payerInfoResponses.email) {
 console.log(`Email: ${payment.payerInfoResponses.email}`);
}
if (payment.payerInfoResponses.phoneNumber) {
 console.log(`Phone: ${payment.payerInfoResponses.phoneNumber.number}`);
 console.log(`Country: ${payment.payerInfoResponses.phoneNumber.country}`);
}
if (payment.payerInfoResponses.physicalAddress) {
 const address = payment.payerInfoResponses.physicalAddress;
 console.log(`Shipping Address: ${address.name.firstName} ${address.name.familyName}, ${address.address1}, ${address.city}, ${address.state} ${address.postalCode}`);
}
 }
} catch (error) {
 console.error(`Payment failed: ${error.message}`);
}
```Supported request types:

| type | returns |
| ---------------------------- | ----------------------------------------------------------------------------------------------------- |
| <code>email</code> | string |
| <code>name</code> | \{ firstName, familyName } |
| <code>phoneNumber</code> | \{ number, country } |
| <code>physicalAddress</code> | [full address object](/base-account/reference/core/capabilities/datacallback#physical-address-object) |
| <code>onchainAddress</code> | string |


> Warning:
Required by default — set <code>optional: true</code> to avoid aborting the payment if the user declines.
> Note:
**How to validate the user's information?**

 You can use the`callbackURL`to validate the user's information on the server side.

 Learn more about this in the [callbackURL reference](/base-account/reference/core/capabilities/datacallback).

## Polling example
#### Code```ts
import { getPaymentStatus } from '@base-org/account';

export async function checkPayment(txId, testnet = false) {
 const status = await getPaymentStatus({
id: txId,
testnet // Must match the testnet setting from the original pay call
 });
 if (status.status === 'completed') {
// fulfil order
 }
}
```## Add the Base Pay Button

Use the pre-built component for a native look-and-feel:
#### Code```tsx
import { BasePayButton } from '@base-org/account-ui/react';
import { pay } from '@base-org/account';

export function Checkout {
 const handlePayment = async => {
try {
 const payment = await pay({ amount: '5.00', to: '0xRecipient' });
 console.log(`Payment sent! Transaction ID: ${payment.id}`);
} catch (error) {
 console.error(`Payment failed: ${error.message}`);
}
 };

 return (
<BasePayButton
 colorScheme="light"
 onClick={handlePayment}
/>
 );
}
````

See full props and theming options in the [Button Reference](/base-account/reference/ui-elements/base-pay-button) and [Brand Guidelines](/base-account/reference/ui-elements/brand-guidelines).

> Warning:
> **Please Follow the Brand Guidelines**

If you intend on using the BasePayButton, please follow the [Brand Guidelines](/base-account/reference/ui-elements/brand-guidelines) to ensure consistency across your application.

## Test on Base Sepolia

1. Get test USDC from the <a href="https://faucet.circle.com target="\_blank">Circle Faucet</a> (select "Base Sepolia").

2. Pass <code>testnet: true</code> in your <code>pay</code> and <code>getPaymentStatus</code> calls.

3. Use <a href="https://sepolia.basescan.org target="\_blank">Sepolia BaseScan</a> to watch the transaction.

# Accept Recurring Payments

> Enable subscription-based revenue models with automatic USDC payments

export const Button = ({children, disabled, variant = "primary", size = "medium", iconName, roundedFull = false, className = '', fullWidth = false, onClick = undefined}) => {
const variantStyles = {
primary: 'bg-blue text-black border border-blue hover:bg-blue-80 active:bg-[#06318E] dark:text-white',
secondary: 'bg-white border border-white text-palette-foreground hover:bg-zinc-15 active:bg-zinc-30',
outlined: 'bg-transparent text-white border border-white hover:bg-white hover:text-black active:bg-[#E3E7E9]'
};
const sizeStyles = {
medium: 'text-md px-4 py-2 gap-3',
large: 'text-lg px-6 py-4 gap-5'
};
const sizeIconRatio = {
medium: '0.75rem',
large: '1rem'
};
const classes = ['text-md px-4 py-2 whitespace-nowrap', 'flex items-center justify-center', 'disabled:opacity-40 disabled:pointer-events-none', 'transition-all', variantStyles[variant], sizeStyles[size], roundedFull ? 'rounded-full' : 'rounded-lg', fullWidth ? 'w-full' : 'w-auto', className];
const buttonClasses = classes.filter(Boolean).join(' ');
const iconSize = sizeIconRatio[size];
return <button type="button" disabled={disabled} className={buttonClasses} onClick={onClick}>
<span>{children}</span>
{iconName && <Icon name={iconName} width={iconSize} height={iconSize} color="currentColor" />}
</button>;
};

export const BaseBanner = ({content = null, id, dismissable = true}) => {
const LOCAL_STORAGE_KEY_PREFIX = 'cb-docs-banner';
const [isVisible, setIsVisible] = useState(false);
const onDismiss = => {
localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}-${id}`, 'false');
setIsVisible(false);
};
useEffect( => {
const storedValue = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}-${id}`);
setIsVisible(storedValue !== 'false');
}, []);
if (!isVisible) {
return null;
}
return <div className="fixed bottom-0 left-0 right-0 bg-white py-8 px-4 lg:px-12 z-50 text-black dark:bg-black dark:text-white border-t dark:border-gray-95">

 <div className="flex items-center max-w-8xl mx-auto">
 {typeof content === 'function' ? content({
 onDismiss
 }) : content}
 {dismissable && <button onClick={onDismiss} className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" aria-label="Dismiss banner">
 ✕
 </button>}
 </div>
 </div>;
};

export const SignInWithBaseButton = ({colorScheme = 'light'}) => {
const isLight = colorScheme === 'light';
return <button type="button" style={{
 display: 'flex',
 alignItems: 'center',
 justifyContent: 'center',
 gap: '8px',
 padding: '12px 16px',
 backgroundColor: isLight ? '#ffffff' : '#000000',
 border: 'none',
 borderRadius: '8px',
 cursor: 'pointer',
 fontFamily: 'system-ui, -apple-system, sans-serif',
 fontSize: '14px',
 fontWeight: '500',
 color: isLight ? '#000000' : '#ffffff',
 minWidth: '180px',
 height: '44px'
 }}>

 <div style={{
 width: '16px',
 height: '16px',
 backgroundColor: isLight ? '#0000FF' : '#FFFFFF',
 borderRadius: '2px',
 flexShrink: 0
 }} />
 <span>Sign in with Base</span>
 </button>;
};

export const BasePayButton = ({colorScheme = 'light'}) => {
const isLight = colorScheme === 'light';
return <button type="button" style={{
 display: 'flex',
 alignItems: 'center',
 justifyContent: 'center',
 padding: '12px 16px',
 backgroundColor: isLight ? '#ffffff' : '#0000FF',
 border: 'none',
 borderRadius: '8px',
 cursor: 'pointer',
 fontFamily: 'system-ui, -apple-system, sans-serif',
 minWidth: '180px',
 height: '44px'
 }}>
<img src={isLight ? '/images/base-account/BasePayBlueLogo.png' : '/images/base-account/BasePayWhiteLogo.png'} alt="Base Pay" style={{
 height: '20px',
 width: 'auto'
 }} />
</button>;
};

## Start accepting recurring payments with Base Pay Subscriptions

Base Subscriptions enable you to build predictable, recurring revenue streams by accepting automatic USDC payments. Whether you're running a SaaS platform, content subscription service, or any business model requiring regular payments, Base Subscriptions provide a seamless solution with no merchant fees.

**Key Capabilities:**

<AccordionGroup>
 <Accordion title="Flexible Billing Periods">
 Support any billing cycle that fits your business model:

- Daily subscriptions for short-term services
- Weekly for regular deliveries or services
- Monthly for standard SaaS subscriptions
- Annual for discounted long-term commitments
- Custom periods (e.g., 14 days, 90 days) for unique models
  </Accordion>

 <Accordion title="Partial and Usage-Based Charging">
 Charge any amount up to the permitted limit:

- Fixed recurring amounts for predictable billing
- Variable usage-based charges within a cap
- Tiered pricing with different charge amounts
- Prorated charges for mid-cycle changes
  </Accordion>

 <Accordion title="Subscription Management">
 Full control over the subscription lifecycle:

- Real-time status checking to verify active subscriptions
- Remaining charge amount for the current period
- Next period start date for planning
- Cancellation detection for immediate updates
  </Accordion>

 <Accordion title="Enterprise-Ready Features">
 Built for production use cases:

- No transaction fees or platform cuts
- Instant settlement in USDC stablecoin
- Testnet support for development and testing
- Detailed transaction history for accounting
- Programmatic access via SDK
  </Accordion>
  </AccordionGroup>

## How It Works

Base Subscriptions leverage **Spend Permissions** – a powerful onchain primitive that allows users to grant revocable spending rights to applications. Here's the complete flow:

### Step: User Approves Subscription

Your customer grants your application permission to charge their wallet up to a specified amount each billing period. This is a one-time approval that remains active until cancelled.

### Step: Application Charges Periodically

Your backend service charges the subscription when payment is due, without requiring any user interaction. You can charge up to the approved amount per period.

### Step: Smart Period Management

The spending limit automatically resets at the start of each new period. If you don't charge the full amount in one period, it doesn't roll over.

### Step: User Maintains Control

Customers can view and cancel their subscriptions anytime through their wallet, ensuring transparency and trust.

## Implementation Guide

### Architecture Overview

A complete subscription implementation requires both client and server components:

**Client-Side (Frontend):**

- User interface for subscription creation
- Create wallet requests and handle user responses

**Server-Side (Backend - Node.js):**

- CDP smart wallet for executing charges and revocations
- Scheduled jobs for periodic billing
- Database for subscription tracking
- Handlers for status updates
- Retry logic for failed charges

<Note>
 **CDP-Powered Backend**

Base Subscriptions use **CDP (Coinbase Developer Platform) server wallets** for effortless backend management. The `charge`and`revoke`functions handle all transaction details automatically:

- ✅ Automatic wallet management
- ✅ Built-in transaction signing
- ✅ Gas estimation and nonce handling
- ✅ Optional paymaster support for gasless transactions

Get CDP credentials from [CDP Portal](https://portal.cdp.coinbase.com/projects/api-keys)
</Note>

> Warning:
> **Security Requirements**

To accept recurring payments, you need:

1.  CDP credentials (API key ID, secret, and wallet secret)
2.  Backend infrastructure (Node.js) to execute charges securely
3.  Database to store and manage subscription IDs
4.  Never expose CDP credentials in client-side code

### Setup: Create Your Subscription Owner Wallet

First, set up your CDP smart wallet that will act as the subscription owner:

#### Code```typescript

import { base } from '@base-org/account/node';

// Backend setup (Node.js only)
// Set CDP credentials as environment variables:
// CDP_API_KEY_ID, CDP_API_KEY_SECRET, CDP_WALLET_SECRET
// PAYMASTER_URL (recommended for gasless transactions)

async function setupSubscriptionWallet {
try {
// Create or retrieve your subscription owner wallet (CDP smart wallet)
const wallet = await base.subscription.getOrCreateSubscriptionOwnerWallet({
walletName: 'my-app-subscriptions' // Optional: customize wallet name
});

console.log('✅ Subscription owner wallet ready!');
console.log(`Smart Wallet Address: ${wallet.address}`);
console.log(`Wallet Name: ${wallet.walletName}`);

// Make this address available to your frontend
// Option 1: Store in database/config
// Option 2: Expose via API endpoint
// Option 3: Set as public environment variable (e.g., NEXT_PUBLIC_SUBSCRIPTION_OWNER)

return wallet;
} catch (error) {
console.error('Failed to setup wallet:', error.message);
throw error;
}
}

// Run once at application startup
setupSubscriptionWallet;

// Optional: Provide an API endpoint for the frontend to fetch the address
export async function getSubscriptionOwnerAddress {
const wallet = await base.subscription.getOrCreateSubscriptionOwnerWallet;
return wallet.address;
}

````<Note>
 **Backend Only**: This setup runs in your Node.js backend with CDP credentials. The resulting wallet address is public and safe to share with your frontend for use in`subscribe`calls.
</Note>


> Warning:
**Keep CDP Credentials Private**: Never expose CDP credentials (API key, secrets) to the frontend. Only the subscription owner wallet address needs to be accessible to the frontend.

### Client-Side: Create Subscriptions

Users create subscriptions from your frontend application:
#### Code```tsx
import React, { useState } from 'react';
import { base } from '@base-org/account';

// This address comes from your backend setup (see setup.ts example above)
// You can fetch it from your backend or configure it as a public env var
const SUBSCRIPTION_OWNER_ADDRESS = "0xYourCDPWalletAddress"; // Replace with your actual address

export function SubscriptionButton {
 const [loading, setLoading] = useState(false);
 const [subscribed, setSubscribed] = useState(false);
 const [subscriptionId, setSubscriptionId] = useState('');

 const handleSubscribe = async => {
setLoading(true);

try {
 // Create subscription
 const subscription = await base.subscription.subscribe({
recurringCharge: "29.99",
subscriptionOwner: SUBSCRIPTION_OWNER_ADDRESS, // Address from your backend CDP wallet
periodInDays: 30,
testnet: false
 });

 // Store subscription ID for future reference
 setSubscriptionId(subscription.id);
 console.log('Subscription created:', subscription.id);
 console.log('Payer:', subscription.subscriptionPayer);
 console.log('Amount:', subscription.recurringCharge);
 console.log('Period:', subscription.periodInDays, 'days');

 // Send subscription ID to your backend
 await saveSubscriptionToBackend(subscription.id, subscription.subscriptionPayer);

 setSubscribed(true);

} catch (error) {
 console.error('Subscription failed:', error);
 alert('Failed to create subscription: ' + error.message);
} finally {
 setLoading(false);
}
 };

 const saveSubscriptionToBackend = async (id: string, payer: string) => {
// Example API call to store subscription in your database
const response = await fetch('/api/subscriptions', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ subscriptionId: id, payerAddress: payer })
});

if (!response.ok) {
 throw new Error('Failed to save subscription');
}
 };

 if (subscribed) {
return (
 <div className="subscription-status">
<Check>✅ Subscription active</Check>
<p>Subscription ID: {subscriptionId.slice(0, 10)}...</p>
 </div>
);
 }

 return (
<button
 onClick={handleSubscribe}
 disabled={loading}
 className="subscribe-button"
>
 {loading ? 'Processing...' : 'Subscribe - $29.99/month'}
</button>
 );
}
```### Server-Side: Charge Subscriptions

Execute charges effortlessly from your backend using CDP:
#### Code```typescript
import { base } from '@base-org/account/node';

// Requires: CDP_API_KEY_ID, CDP_API_KEY_SECRET, CDP_WALLET_SECRET env vars
// Recommended: PAYMASTER_URL for gasless transactions

async function chargeSubscription(subscriptionId: string, recipientAddress?: string) {
 try {
// 1. Check subscription status
const status = await base.subscription.getStatus({
 id: subscriptionId,
 testnet: false
});

if (!status.isSubscribed) {
 console.log('Subscription cancelled by user');
 return { success: false, reason: 'cancelled' };
}

const availableCharge = parseFloat(status.remainingChargeInPeriod || '0');

if (availableCharge === 0) {
 console.log(`No charge available until ${status.nextPeriodStart}`);
 return { success: false, reason: 'no_charge_available' };
}

// 2. Charge the subscription - CDP handles everything automatically
// Using paymaster for gasless transactions (recommended)
const result = await base.subscription.charge({
 id: subscriptionId,
 amount: 'max-remaining-charge',
 paymasterUrl: process.env.PAYMASTER_URL, // Optional: for gasless transactions
 recipient: recipientAddress, // Optional: send USDC to specific address
 testnet: false
});

console.log(`✅ Charged ${result.amount} USDC (gasless)`);
console.log(`Transaction: ${result.id}`);
if (recipientAddress) {
 console.log(`Sent to: ${recipientAddress}`);
}

return {
 success: true,
 transactionHash: result.id,
 amount: result.amount,
 recipient: result.recipient
};

 } catch (error) {
console.error('Charge failed:', error);
return { success: false, error: error.message };
 }
}
```### Server-Side: Revoke Subscriptions

Cancel subscriptions programmatically from your backend:
#### Code```typescript
import { base } from '@base-org/account/node';

async function revokeSubscription(subscriptionId: string, reason: string) {
 try {
// Revoke the subscription with paymaster for gasless transactions
const result = await base.subscription.revoke({
 id: subscriptionId,
 paymasterUrl: process.env.PAYMASTER_URL, // Optional: for gasless transactions
 testnet: false
});

console.log(`✅ Revoked subscription: ${subscriptionId}`);
console.log(`Transaction: ${result.id}`);
console.log(`Reason: ${reason}`);

return {
 success: true,
 transactionHash: result.id
};

 } catch (error) {
console.error('Revoke failed:', error);
return { success: false, error: error.message };
 }
}

// Usage examples
async function handleUserCancellation(subscriptionId: string) {
 return await revokeSubscription(subscriptionId, 'user_requested');
}

async function handlePolicyViolation(subscriptionId: string) {
 return await revokeSubscription(subscriptionId, 'policy_violation');
}
```<Note>
 **Automatic Transaction Management**: The`charge`and`revoke`functions handle all transaction details including wallet management, gas estimation, nonce handling, and transaction confirmation. Use the`paymasterUrl`parameter to enable gasless transactions for your users.
</Note>


> Note:
**Gasless Transactions**: Set the`PAYMASTER_URL`environment variable to sponsor gas fees for your subscription charges and revocations. This creates a seamless experience where your backend covers all gas costs. Get your paymaster URL from the [CDP Portal](https://portal.cdp.coinbase.com/)

### Fund Management

By default, charged USDC remains in your subscription owner wallet. You can optionally specify a`recipient`address to automatically transfer funds to a different address:

<Tabs>
 <Tab title="Default (Keep in Owner Wallet)">
#### Code```typescript
// Funds stay in the subscription owner wallet
const result = await base.subscription.charge({
 id: subscriptionId,
 amount: 'max-remaining-charge',
 testnet: false
});

// USDC is now in your CDP smart wallet
// Access it later or transfer as needed
```</Tab>

 <Tab title="Send to Treasury Wallet">
#### Code```typescript
// Automatically send to your treasury wallet
const result = await base.subscription.charge({
 id: subscriptionId,
 amount: 'max-remaining-charge',
 recipient: '0xYourTreasuryAddress',
 testnet: false
});

// USDC is sent directly to the recipient address
console.log(`Sent ${result.amount} to ${result.recipient}`);
```</Tab>

 <Tab title="Dynamic Recipients">
#### Code```typescript
// Send to different addresses based on subscription type
async function chargeWithRecipient(subscriptionId: string, plan: string) {
 const recipients = {
premium: '0xPremiumTreasuryAddress',
basic: '0xBasicTreasuryAddress',
enterprise: '0xEnterpriseTreasuryAddress'
 };

 return await base.subscription.charge({
id: subscriptionId,
amount: 'max-remaining-charge',
recipient: recipients[plan],
testnet: false
 });
}
```</Tab>
</Tabs>

### Testing on Testnet

Test your subscription implementation on Base Sepolia before going live:
#### Code```typescript
// Frontend: Create subscription on testnet
const subscription = await base.subscription.subscribe({
 recurringCharge: "10.00",
 subscriptionOwner: SUBSCRIPTION_OWNER_ADDRESS,
 periodInDays: 1, // Daily for faster testing
 testnet: true // Use Base Sepolia
});
```#### Code```typescript
// Backend: Setup wallet on testnet (Node.js only)
import { base } from '@base-org/account/node';

const wallet = await base.subscription.getOrCreateSubscriptionOwnerWallet({
 walletName: 'testnet-subscriptions'
});

// Check status on testnet
const status = await base.subscription.getStatus({
 id: subscriptionId,
 testnet: true
});

// Charge on testnet with paymaster
const result = await base.subscription.charge({
 id: subscriptionId,
 amount: "10.00",
 paymasterUrl: process.env.PAYMASTER_URL, // Gasless transactions
 testnet: true
});

console.log(`Testnet charge (gasless): ${result.id}`);
```## Network and Token Support

**Base Subscriptions (USDC on Base):**

| Network | Chain ID | Token | Status |
| ------------ | -------- | ----- | ------------------- |
| Base Mainnet | 8453 | USDC | ✅ Production Ready |
| Base Sepolia | 84532 | USDC | ✅ Testing Available |

<Note>
 **Custom Implementations Possible**: While Base Subscriptions are optimized for USDC on Base, you can use the underlying [Spend Permissions](/base-account/improve-ux/spend-permissions) primitive to build custom subscription implementations with any ERC-20 token or native ETH on any EVM-compatible chain.
</Note>

## Advanced Topics

### Custom Transaction Handling

For developers who need manual control over transaction execution or want to integrate with existing wallet infrastructure, use the lower-level utilities:

<AccordionGroup>
 <Accordion title="prepareCharge - Manual Charge Execution">
 If you can't use CDP wallets,`prepareCharge`gives you call data to execute manually:
#### Code```typescript
import { base } from '@base-org/account';

// Prepare charge call data
const chargeCalls = await base.subscription.prepareCharge({
 id: subscriptionId,
 amount: 'max-remaining-charge',
 testnet: false
});

// Execute with your own wallet infrastructure
// (requires custom wallet client setup)
````

See [`prepareCharge`reference](/base-account/reference/base-pay/prepareCharge) for details.
</Accordion>

 <Accordion title="prepareRevoke - Manual Revoke Execution">
 Similarly,`prepareRevoke`provides revocation call data:
#### Code```typescript
import { base } from '@base-org/account';

// Prepare revoke call data
const revokeCall = await base.subscription.prepareRevoke({
id: subscriptionId,
testnet: false
});

// Execute with your own wallet infrastructure

````
 See [`prepareRevoke`reference](/base-account/reference/base-pay/prepareRevoke) for details.
 </Accordion>
</AccordionGroup>

## API Reference



- [subscribe](/base-account/reference/base-pay/subscribe)



- [getStatus](/base-account/reference/base-pay/getStatus)



- [charge](/base-account/reference/base-pay/charge)



- [revoke](/base-account/reference/base-pay/revoke)



- [Setup Owner Wallet](/base-account/reference/base-pay/getOrCreateSubscriptionOwnerWallet)



- [prepareCharge](/base-account/reference/base-pay/prepareCharge)



- [prepareRevoke](/base-account/reference/base-pay/prepareRevoke)



- [Spend Permissions](/base-account/improve-ux/spend-permissions)



- [One-Time Payments](/base-account/guides/accept-payments)



<BaseBanner
 id="privacy-policy"
 dismissable={false}
 content={({ onDismiss }) => (
 <div className="flex items-center">
 <div className="mr-2">
 We're updating the Base Privacy Policy, effective July 25, 2025, to reflect an expansion of Base services. Please review the updated policy here:{" "}
 <a
 href="https://docs.base.org/privacy-policy-2025
 target="_blank"
 className="whitespace-nowrap"
 >
 Base Privacy Policy
 </a>. By continuing to use Base services, you confirm that you have read and understand the updated policy.
 </div>
 <Button onClick={onDismiss}>I Acknowledge</Button>
 </div>
)}
/>


# Batch Transactions

With Base Account, you can send multiple onchain calls in a single transaction. Doing so improves the UX of multi-step interactions by reducing them to a single click. A common example of where you might want to leverage batch transactions is an ERC-20`approve`followed by a swap.

You can submit batch transactions by using the`wallet_sendCalls`RPC method, defined in [EIP-5792](https://eips.ethereum.org/EIPS/eip-5792)

## Installation

Install the Base Account SDK:

<CodeGroup>
#### Command```bash
 npm install @base-org/account
```#### Command```bash
 pnpm add @base-org/account
```#### Command```bash
 yarn add @base-org/account
```#### Command```bash
 bun add @base-org/account
```</CodeGroup>

## Setup

### Initialize the SDK

Import and create the Base Account SDK instance:
#### Code```tsx
import { createBaseAccountSDK, base } from '@base-org/account';

const sdk = createBaseAccountSDK({
 appName: 'Base Account SDK Demo',
 appChainIds: [base.constants.CHAIN_IDS.base],
});

const provider = sdk.getProvider;
```## Basic Batch Transaction

### Simple Multiple Transfers

Send multiple ETH transfers in a single transaction:
#### Code```tsx
import { createBaseAccountSDK, getCryptoKeyAccount, base } from '@base-org/account';
import { numberToHex, parseEther } from 'viem';

const sdk = createBaseAccountSDK({
 appName: 'Batch Transaction Demo',
 appChainIds: [base.constants.CHAIN_IDS.base],
});

const provider = sdk.getProvider;

async function sendBatchTransfers {
 try {
// Get crypto account
const cryptoAccount = await getCryptoKeyAccount;
const fromAddress = cryptoAccount?.account?.address;

// Prepare batch calls
const calls = [
 {
to: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
value: numberToHex(parseEther('0.001')), // 0.001 ETH
data: '0x', // Empty data for simple transfer
 },
 {
to: '0x742d35Cc6634C0532925a3b844Bc9e7595f6E456',
value: numberToHex(parseEther('0.001')), // 0.001 ETH
data: '0x', // Empty data for simple transfer
 }
];

// Send batch transaction
const result = await provider.request({
 method: 'wallet_sendCalls',
 params: [{
version: '2.0.0',
from: fromAddress,
chainId: numberToHex(base.constants.CHAIN_IDS.base),
atomicRequired: true, // All calls must succeed or all fail
calls: calls
 }]
});

console.log('Batch transaction sent:', result);
return result;
 } catch (error) {
console.error('Batch transaction failed:', error);
throw error;
 }
}
```## Contract Interactions

### ERC-20 Approve and Transfer

A common pattern is to approve and then transfer ERC-20 tokens:
#### Code```tsx
import { createBaseAccountSDK, getCryptoKeyAccount, base } from '@base-org/account';
import { numberToHex, parseUnits, encodeFunctionData } from 'viem';

// ERC-20 ABI for approve and transfer functions
const erc20Abi = [
 {
name: 'approve',
type: 'function',
stateMutability: 'nonpayable',
inputs: [
 { name: 'spender', type: 'address' },
 { name: 'amount', type: 'uint256' }
],
outputs: [{ name: '', type: 'bool' }]
 },
 {
name: 'transfer',
type: 'function',
stateMutability: 'nonpayable',
inputs: [
 { name: 'to', type: 'address' },
 { name: 'amount', type: 'uint256' }
],
outputs: [{ name: '', type: 'bool' }]
 }
] as const;

async function approveAndTransfer {
 const sdk = createBaseAccountSDK({
appName: 'ERC-20 Batch Demo',
appChainIds: [base.constants.CHAIN_IDS.base],
 });

 const provider = sdk.getProvider;
 const cryptoAccount = await getCryptoKeyAccount;
 const fromAddress = cryptoAccount?.account?.address;

 const tokenAddress = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'; // USDC on Base
 const spenderAddress = '0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad'; // Example spender
 const recipientAddress = '0xd8da6bf26964af9d7eed9e03e53415d37aa96045';
 const amount = parseUnits('10', 6); // 10 USDC (6 decimals)

 const calls = [
{
 to: tokenAddress,
 value: '0x0',
 data: encodeFunctionData({
abi: erc20Abi,
functionName: 'approve',
args: [spenderAddress, amount]
 })
},
{
 to: tokenAddress,
 value: '0x0',
 data: encodeFunctionData({
abi: erc20Abi,
functionName: 'transfer',
args: [recipientAddress, amount]
 })
}
 ];

 const result = await provider.request({
method: 'wallet_sendCalls',
params: [{
 version: '2.0.0',
 from: fromAddress,
 chainId: numberToHex(base.constants.CHAIN_IDS.base),
 atomicRequired: true,
 calls: calls
}]
 });

 return result;
}
```## Advanced Features

### Checking Wallet Capabilities

Before sending batch transactions, you can check if the wallet supports atomic batching:
#### Code```tsx
async function checkCapabilities {
 const provider = sdk.getProvider;

 try {
const cryptoAccount = await getCryptoKeyAccount;
const address = cryptoAccount?.account?.address;

const capabilities = await provider.request({
 method: 'wallet_getCapabilities',
 params: [address]
});

const baseCapabilities = capabilities[base.constants.CHAIN_IDS.base];

if (baseCapabilities?.atomicBatch?.supported) {
 console.log('Atomic batching is supported');
 return true;
} else {
 console.log('Atomic batching is not supported');
 return false;
}
 } catch (error) {
console.error('Failed to check capabilities:', error);
return false;
 }
}
```### Non-Atomic Batching

Sometimes you want calls to execute sequentially, even if some fail:
#### Code```tsx
const result = await provider.request({
 method: 'wallet_sendCalls',
 params: [{
version: '2.0.0',
from: fromAddress,
chainId: numberToHex(base.constants.CHAIN_IDS.base),
atomicRequired: false, // Allow partial execution
calls: calls
 }]
});
```## Error Handling

Handle common batch transaction errors:
#### Code```tsx
async function sendBatchWithErrorHandling(calls: any[]) {
 try {
const cryptoAccount = await getCryptoKeyAccount;
const fromAddress = cryptoAccount?.account?.address;

const result = await provider.request({
 method: 'wallet_sendCalls',
 params: [{
version: '2.0.0',
from: fromAddress,
chainId: numberToHex(base.constants.CHAIN_IDS.base),
atomicRequired: true,
calls: calls
 }]
});

return { success: true, data: result };
 } catch (error: any) {
console.error('Batch transaction error:', error);

if (error.code === 4001) {
 return { success: false, error: 'User rejected the transaction' };
} else if (error.code === 5740) {
 return { success: false, error: 'Batch too large for wallet to process' };
} else if (error.code === -32602) {
 return { success: false, error: 'Invalid request format' };
} else {
 return { success: false, error: error.message || 'Unknown error' };
}
 }
}
```# Sponsor Gas

> Use Paymasters to sponsor your users' transactions

One of the biggest UX enhancements unlocked by Base Account is the ability for app developers to sponsor their users' transactions.
If your app supports Base Account, you can start sponsoring your users'
transactions by using [standardized Paymaster service communication](https://erc7677.xyz) enabled by [new wallet RPC methods](https://eip5792.xyz)

This guide is specific to using Base Account, you can find our more about using Paymasters with Base in
the [Coinbase Developer Platform documentation](https://docs.cdp.coinbase.com/paymaster/introduction/welcome)

## Implementation Guide


### Step: Set up your Paymaster service
As a prerequisite, you'll need to obtain a Paymaster service URL from a Paymaster service provider.

 We'll use [Coinbase Developer Platform](https://www.coinbase.com/developer-platform) as a Paymaster service provider,
 currently offering up to \$15k in gas credits as part of the [Base Gasless Campaign](/base-account/more/base-gasless-campaign).


> Warning:
**ERC-7677-Compliant Paymaster Providers**

 If you choose to use a different Paymaster service provider, ensure they are [ERC-7677-compliant](https://www.erc7677.xyz/ecosystem/paymasters)

Once you have signed up for [Coinbase Developer Platform](https://www.coinbase.com/developer-platform you get your Paymaster service URL by navigating to **Onchain Tools > Paymaster** as shown below:

 <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
 ![Paymaster CDP](https://mintcdn.com/base-a060aa97/8PjRmmTngJV9JYD_/images/smart-wallet/PaymasterCDP.png?fit=max&auto=format&n=8PjRmmTngJV9JYD_&q=85&s=040048ba1269654414b47b547dd2a315)
 <em>How to get your Paymaster service URL</em>
 </div>


> Warning:
**Should you create a proxy for your Paymaster service?**

 We recommend using a proxy to protect the Paymaster service URL to prevent it from being exposed/leaked on a frontend client.

 For local development, you can use the same URL for the Paymaster service and the proxy.

Once you have your Paymaster service URL, you can proceed to setting up your contracts allowlist.
 This is a list of contracts and function calls that you want to be sponsored by the Paymaster.

 <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
 ![Paymaster CDP Allowlist](https://mintcdn.com/base-a060aa97/8PjRmmTngJV9JYD_/images/smart-wallet/PaymasterAllowlist.png?fit=max&auto=format&n=8PjRmmTngJV9JYD_&q=85&s=a8a3748a4dd7a39ec86d3c91b4d1437a)
 <em>How to set your Paymaster contracts allowlist</em>
 </div>

 Congrats! You've set up your Paymaster service and contracts allowlist.
 It's time to set up the Base Account SDK.

 <Check>
 **You can also choose to create custom advanced policies !**

 You can create a`willSponsor`function to add some extra validation if you need more control over the policy enforcement.`willSponsor`is most likely not needed if you are using [Coinbase Developer Platform](https://www.coinbase.com/developer-platform) as it has built-in policy enforcement features,
 but know that this is still possible if you need it.
 </Check>

### Step: Setup Base Account SDK
Install and initialize the Base Account SDK to interact with Base Account:

 ### Installation

 <CodeGroup>
#### Command```bash
 npm install @base-org/account
```#### Command```bash
 pnpm add @base-org/account
```#### Command```bash
 yarn add @base-org/account
```#### Command```bash
 bun add @base-org/account
```</CodeGroup>

 ### Initialize the SDK
#### Code```tsx
import { createBaseAccountSDK, base } from '@base-org/account';

const sdk = createBaseAccountSDK({
 appName: 'Paymaster Demo',
 appChainIds: [base.constants.CHAIN_IDS.baseSepolia], // or base.constants.CHAIN_IDS.base for mainnet
});

const provider = sdk.getProvider;
```### Step: Send transactions with Paymaster service capability
Once you have your Paymaster service set up, you can now use`wallet_sendCalls`with paymaster capabilities to sponsor transactions.

 <Note>
 **Pass in the proxy URL**

 If you set up a proxy in your app's backend as recommended in step (1) above, you'll want to pass in the proxy URL you created.
 </Note>

 ### Basic Sponsored Transaction

 Here's how to send a sponsored transaction using the`wallet_sendCalls`RPC method:
#### Code```tsx
import { createBaseAccountSDK, getCryptoKeyAccount, base } from '@base-org/account';
import { numberToHex, encodeFunctionData, parseEther } from 'viem';

// Example NFT contract ABI
const nftABI = [
 {
name: 'safeMint',
type: 'function',
stateMutability: 'nonpayable',
inputs: [{ name: 'to', type: 'address' }],
outputs: []
 }
] as const;

async function sendSponsoredTransaction {
 const sdk = createBaseAccountSDK({
appName: 'Paymaster Demo',
appChainIds: [base.constants.CHAIN_IDS.baseSepolia],
 });

 const provider = sdk.getProvider;

 try {
// Get the user's account
const cryptoAccount = await getCryptoKeyAccount;
const fromAddress = cryptoAccount?.account?.address;

if (!fromAddress) {
 throw new Error('No account found');
}

// Your Paymaster service URL (use your proxy URL)
const paymasterServiceUrl = process.env.NEXT_PUBLIC_PAYMASTER_PROXY_SERVER_URL;

// Prepare the transaction call
const nftAddress = '0x119Ea671030FBf79AB93b436D2E20af6ea469a19';
const calls = [
 {
to: nftAddress,
value: '0x0',
data: encodeFunctionData({
 abi: nftABI,
 functionName: 'safeMint',
 args: [fromAddress]
})
 }
];

// Send the transaction with paymaster capabilities
const result = await provider.request({
 method: 'wallet_sendCalls',
 params: [{
version: '1.0',
chainId: numberToHex(base.constants.CHAIN_IDS.baseSepolia),
from: fromAddress,
calls: calls,
capabilities: {
 paymasterService: {
 url: paymasterServiceUrl
 }
}
 }]
});

console.log('Sponsored transaction sent:', result);
return result;
 } catch (error) {
console.error('Sponsored transaction failed:', error);
throw error;
 }
}
```### Multiple Sponsored Transactions

 You can also batch multiple transactions and have them all sponsored:
#### Code```tsx
async function sendMultipleSponsoredTransactions {
 const sdk = createBaseAccountSDK({
appName: 'Paymaster Demo',
appChainIds: [base.constants.CHAIN_IDS.baseSepolia],
 });

 const provider = sdk.getProvider;
 const cryptoAccount = await getCryptoKeyAccount;
 const fromAddress = cryptoAccount?.account?.address;

 const paymasterServiceUrl = process.env.NEXT_PUBLIC_PAYMASTER_PROXY_SERVER_URL;

 // Multiple calls in a single sponsored transaction
 const calls = [
{
 to: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
 value: numberToHex(parseEther('0.001')),
 data: '0x' // Simple ETH transfer
},
{
 to: '0x742d35Cc6634C0532925a3b844Bc9e7595f6E456',
 value: numberToHex(parseEther('0.001')),
 data: '0x' // Another ETH transfer
}
 ];

 const result = await provider.request({
method: 'wallet_sendCalls',
params: [{
 version: '1.0',
 chainId: numberToHex(base.constants.CHAIN_IDS.baseSepolia),
 from: fromAddress,
 calls: calls,
 capabilities: {
paymasterService: {
 url: paymasterServiceUrl
}
 }
}]
 });

 return result;
}
```### Check Paymaster Capabilities

 Before sending sponsored transactions, you can check if the wallet supports paymaster services:
#### Code```tsx
async function checkPaymasterSupport {
 const sdk = createBaseAccountSDK({
appName: 'Paymaster Demo',
appChainIds: [base.constants.CHAIN_IDS.baseSepolia],
 });

 const provider = sdk.getProvider;
 const cryptoAccount = await getCryptoKeyAccount;
 const address = cryptoAccount?.account?.address;

 try {
const capabilities = await provider.request({
 method: 'wallet_getCapabilities',
 params: [address]
});

const baseCapabilities = capabilities[base.constants.CHAIN_IDS.baseSepolia];

if (baseCapabilities?.paymasterService?.supported) {
 console.log('Paymaster service is supported');
 return true;
} else {
 console.log('Paymaster service is not supported');
 return false;
}
 } catch (error) {
console.error('Failed to check paymaster capabilities:', error);
return false;
 }
}
```That's it! Base Account will handle the rest. If your Paymaster service is able to sponsor the transaction,
 in the UI Base Account will indicate to your user that the transaction is sponsored.

# Use Sub Accounts

> Learn how to create and use Sub Accounts using Base Account SDK

export const GithubRepoCard = ({title, githubUrl}) => {
 return <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="mb-4 flex items-center rounded-lg bg-zinc-900 p-4 text-white transition-all hover:bg-zinc-800">
 <div className="flex w-full items-center gap-3">
 <svg height="24" width="24" className="flex-shrink-0 dark:fill-white" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg>
 <path fill="currentColor" fillRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
 </svg>

 <div className="flex min-w-0 flex-grow flex-col">
 <span className="truncate text-base font-medium">{title}</span>
 <span className="truncate text-xs text-zinc-400">{githubUrl}</span>
 </div>

 <svg className="h-5 w-5 flex-shrink-0 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
 </svg>
 </div>
 </a>;
};

## What are Sub Accounts?

Sub Accounts allow you to provision app-specific wallet accounts for your users that are embedded directly in your application. Once created, you can interact with them just as you would with any other wallet via the wallet provider or popular onchain libraries like OnchainKit, wagmi, and viem.

<Note>
 Looking for a full implementation? Jump to the [Complete Integration Example](/base-account/improve-ux/sub-accounts#complete-integration-example).
</Note>

## Key Benefits

* **Frictionless transactions**: Eliminate repeated signing prompts for high frequency and agentic use cases or take full control of the transaction flow.
* **No funding flows required**: Spend Permissions allow Sub Accounts to spend directly from the universal Base Account's balance.
* **User control**: Users can manage all their sub accounts at [account.base.app](https://account.base.app)

<Note>
 If you would like to see a live demo of Sub Accounts in action, check out our [Sub Accounts Demo](https://sub-accounts-fc.vercel.app)
</Note>


> Note:
**Spend Permissions**

 Sub Accounts are optimized for use with Spend Permissions to allow your app to take advantage of the user's existing Base Account balances. See the [Spend Permissions](/base-account/improve-ux/spend-permissions) guide for more information about how they work.

## Installation

Install the Base Account SDK:

<CodeGroup>
#### Command```bash
 npm install @base-org/account
```#### Command```bash
 pnpm add @base-org/account
```#### Command```bash
 yarn add @base-org/account
```#### Command```bash
 bun add @base-org/account
```</CodeGroup>

## Quickstart

The fastest way to adopt Sub Accounts is to set`creation`to`on-connect`and`defaultAccount`to`sub`in the SDK configuration.
#### Code```tsx
const sdk = createBaseAccountSDK({
 // ...
 subAccounts: {
creation: 'on-connect',
defaultAccount: 'sub',
 }
});
```This will automatically create a Sub Account for the user when they connect their Base Account and transactions will automatically be sent from the Sub Account unless you specify the`from`parameter in your transaction request to be the universal account address. Spend Permissions will also be automatically requested for the Sub Account as your app needs them.

This is what the user will see when they connect their Base Account and automatic Sub Accounts are enabled:

<div style={{ display: 'flex', justifyContent: 'center'}}>
 ![](https://mintcdn.com/base-a060aa97/YPpQym_GkqOSL1yD/images/base-account/SubAccountCreationConnect.png?fit=max&auto=format&n=YPpQym_GkqOSL1yD&q=85&s=4551f5206023cd25048ea23888e9e5f6)
</div>


> Note:
We recommend using a [Paymaster](/base-account/improve-ux/sponsor-gas/paymasters) to sponsor gas to ensure the best user experience when integrating Sub Accounts. You can set a paymaster to be used for all transactions by configuring the`paymasterUrls`parameter in the SDK configuration. See the [createBaseAccount](/base-account/reference/core/createBaseAccount#param-paymaster-urls) reference for more information.

## Using Sub Accounts

### Initialize the SDK

First, set up the Base Account SDK. Be sure to customize the`appName`and`appLogoUrl`to match your app as this will be displayed in the wallet connection popup and in the account.base.app dashboard. You can also customize the`appChainIds`to be the chains that your app supports.
#### Code```tsx
import { createBaseAccountSDK, getCryptoKeyAccount } from '@base-org/account';
import { base } from 'viem/chains';

// Initialize SDK with Sub Account configuration
const sdk = createBaseAccountSDK({
 appName: 'Base Account SDK Demo',
 appChainIds: [base.id],
});

// Get an EIP-1193 provider
const provider = sdk.getProvider
```### Create a Sub Account


> Note:
Make sure to authenticate the user with their Base Account before creating a Sub Account.
 For that, you can choose one of the following options:

 * Follow the [Authenticate users](/base-account/guides/authenticate-users) guide
 * Simply use`provider.request({ method: 'eth_requestAccounts' });`for a simple wallet connection

Create a Sub Account for your application using the provider's [wallet\_addSubAccount](/base-account/reference/core/provider-rpc-methods/wallet_addSubAccount) RPC method. When no`publicKey`parameter is provided, a non-extractable browser CryptoKey is generated and used to sign on behalf of the Sub Account.
#### Code```tsx
// Create sub account
const subAccount = await provider.request({
 method: 'wallet_addSubAccount',
 params: [
{
 account: {
type: 'create',
 },
}
 ],
});

console.log('Sub Account created:', subAccount.address);
```Alternatively, you can use the SDK convenience method:
#### Code```tsx
const subAccount = await sdk.subAccount.create;

console.log('Sub Account created:', subAccount.address);
```This is what the user will see when prompted to create a Sub Account:

<div style={{ display: 'flex', justifyContent: 'center'}}>
 ![](https://mintcdn.com/base-a060aa97/YPpQym_GkqOSL1yD/images/base-account/SubAccountCreation.png?fit=max&auto=format&n=YPpQym_GkqOSL1yD&q=85&s=819bb3e83ec767750090a266bdbdbf86)
</div>

### Get Existing Sub Account

Retrieve an existing Sub Account using the provider's [wallet\_getSubAccounts](/base-account/reference/core/provider-rpc-methods/wallet_getSubAccounts) RPC method. This will return the Sub Account associated with the app's domain and is useful to check if a Sub Account already exists for the user to determine if one needs to be created.
#### Code```tsx
// Get the universal account
const [universalAddress] = await provider.request({
 method: "eth_requestAccounts",
 params: []
})

// Get sub account for universal account
const { subAccounts: [subAccount] } = await provider.request({
 method: 'wallet_getSubAccounts',
 params: [{
account: universalAddress,
domain: window.location.origin,
 }]
})

if (subAccount) {
 console.log('Sub Account found:', subAccount.address);
} else {
 console.log('No Sub Account exists for this app');
}
```Alternatively, you can use the SDK convenience method:
#### Code```tsx
const subAccount = await sdk.subAccount.get;

console.log('Sub Account:', subAccount);
```### Send transactions

To send transactions from the connected sub account you can use EIP-5792`wallet_sendCalls`or`eth_sendTransaction`. You need to specify the `from`parameter to be the sub account address.


> Note:
When the Sub Account is connected, it is the second account in the array returned by`eth_requestAccounts`or`eth_accounts`. `wallet_addSubAccount`needs to be called in each session before the Sub Account can be used. It will not trigger a new Sub Account creation if one already exists.

 If you are using`mode: 'auto'`, the Sub Account will be the first account in the array.

First, get all the accounts that are available, of which the sub account will be the second account:
#### Code
```tsx
const [universalAddress, subAccountAddress] = await provider.request({
 method: "eth_requestAccounts", // or "eth_accounts" if already connected
 params: []
})
````

Then, send the transaction from the sub account:

**`wallet_sendCalls`**

#### Code

```tsx
const callsId = await provider.request({
 method: 'wallet_sendCalls',
 params: [{
version: "2.0",
atomicRequired: true,
from: subAccountAddress, // Specify the sub account address
calls: [{
 to: '0x...',
 data: '0x...',
 value: '0x...',
}],
capabilities: {
 // https://docs.cdp.coinbase.com/paymaster/introduction/welcome
 paymasterUrl: "https://
},
 }]
})

console.log('Calls sent:', callsId);
```

**`eth_sendTransaction`**

#### Code

````tsx
const tx = await provider.request({
 method: 'eth_sendTransaction',
 params: [{
from: subAccountAddress, // Specify the sub account address
to: '0x...',
data: '0x...',
value: '0x...',
 }]
})

console.log('Transaction sent:', tx);
```We recommend using`wallet_sendCalls`in conjunction with a paymaster to ensure the best user experience. See the [Paymasters](/base-account/improve-ux/sponsor-gas/paymasters) guide for more information.

## Advanced Usage

### Import an existing account

If you already have a deployed Smart Contract Account and would like to turn it into a Sub Account of the connected Base Account, you can import it as a Sub Account using the provider RPC method:
#### Code```tsx
const subAccount = await provider.request({
 method: 'wallet_addSubAccount',
 params: [
{
 account: {
type: 'deployed',
address: '0xYourSmartContractAccountAddress',
chainId: 8453 // the chain the account is deployed on
 },
}
 ],
});

console.log('Sub Account added:', subAccount.address);
````

<Note>
 Before the Sub Account is imported, you will need to add the Base Account address as an owner of the Sub Account. This currently needs to be done manually
 by calling the [`addOwnerAddress`](https://github.com/coinbase/smart-wallet/blob/a8c6456f3a6d5d2dea08d6336b3be13395cacd42/src/MultiOwnable.sol#L101) or [`addOwnerPublicKey`](https://github.com/coinbase/smart-wallet/blob/a8c6456f3a6d5d2dea08d6336b3be13395cacd42/src/MultiOwnable.sol#L109) functions on the Smart Contract of the Sub Account that was imported and setting the Base Account address as the owner.

Additionally, only Coinbase Smart Wallet contracts are currently supported for importing as a Sub Account into your Base Account.

The Coinbase Smart Wallet contract ABI can be found on [GitHub](https://github.com/base/account-sdk/blob/master/packages/account-sdk/src/sign/base-account/utils/constants.ts#L8)
</Note>

### Add Owner Account

Sub Accounts automatically detect when an ownership update is needed when a signature is required and will prompt the user to approve the update before signing. However, you can also add an owner to a Sub Account manually using the SDK convenience method:

#### Code

````tsx
const ownerAccount = await sdk.subAccount.addOwner({
 address: subAccount?.address,
 publicKey: cryptoAccount?.account?.publicKey,
 chainId: base.id,
});

console.log('Owner added to Sub Account');
```This generates a transaction to call the`addOwnerAddress`or`addOwnerPublicKey`functions on the Sub Account's smart contract to add the owner.

<Note>
 Ownership changes are expected if the user signs in to your app on a new device or browser.

 Ensure you do not lose your app's Sub Account signer keys when using the SDK on the server (e.g. Node.js) as updating the owner requires a signature from the user, which cannot be requested from server contexts.
</Note>

## Auto Spend Permissions

Auto Spend Permissions allows Sub Accounts to access funds from their parent Base Account when transaction balances are insufficient. This feature can also establish ongoing spend permissions, enabling future transactions to execute without user approval prompts, reducing friction in your app's transaction flow.

This feature is **enabled by default** when using Sub Accounts.

### How it works

**First-time transaction flow:**
When a Sub Account attempts its first transaction, Base Account displays a popup for user approval. During this approval process, Base Account:

* Automatically detects any missing tokens (native or ERC-20) needed for the transaction
* Requests a transfer of the required funds from the parent Base Account to the Sub Account to fulfill the current transaction
* Allows the user to optionally grant ongoing spend permissions for future transactions in that token

**Subsequent transactions:**
If the user granted spend permissions, future transactions follow this priority:

1. First, attempt using existing Sub Account balances and granted spend permissions
2. If insufficient, prompt the user to authorize additional transfers and/or spend permissions from their Base Account


> Warning:
Spend permission requests are limited to the first token when multiple transfers are needed for a single transaction. Additional tokens require separate approvals.

### Configuration

If your users' Sub Accounts will be funded manually, you can disable Auto Spend Permissions by setting`funding`to`manual`in your SDK configuration:
#### Code```tsx
const sdk = createBaseAccountSDK({
 appName: 'Base Account SDK Demo',
 appChainIds: [base.id],
 subAccounts: {
funding: 'manual', // Disable auto spend permissions
 }
});
```## Technical Details

Base Account's self-custodial design requires a user passkey prompt for each wallet interaction, such as transactions or message signing. While this ensures user awareness and approval of every wallet interaction, it can impact user experience in applications requiring frequent wallet interactions.

To support Base Account with user experiences that need more developer control over wallet interactions, we've built Sub Accounts in conjunction with [ERC-7895](https://eip.tools/eip/7895 a new wallet RPC for creating hierarchical relationships between wallet accounts.

These Sub Accounts are linked to the end user's Base Account through an onchain relationship. When combined with our [Spend Permission feature](/base-account/improve-ux/spend-permissions), this creates a powerful foundation for provisioning and funding app accounts securely, while giving you ample control over building the user experience that makes the most sense for your application.

## Complete Integration Example

Here's a full React component that demonstrates Sub Account creation and usage:
#### Code```tsx
import { createBaseAccountSDK } from "@base-org/account";
import { useCallback, useEffect, useState } from "react";
import { baseSepolia } from "viem/chains";

interface SubAccount {
 address: `0x${string}`;
 factory?: `0x${string}`;
 factoryData?: `0x${string}`;
}

interface GetSubAccountsResponse {
 subAccounts: SubAccount[];
}

interface WalletAddSubAccountResponse {
 address: `0x${string}`;
 factory?: `0x${string}`;
 factoryData?: `0x${string}`;
}

export default function SubAccountDemo {
 const [provider, setProvider] = useState<ReturnType<
ReturnType<typeof createBaseAccountSDK>["getProvider"]
 > | null>(null);
 const [subAccount, setSubAccount] = useState<SubAccount | null>(null);
 const [universalAddress, setUniversalAddress] = useState<string>("");
 const [connected, setConnected] = useState(false);
 const [loadingSubAccount, setLoadingSubAccount] = useState(false);
 const [loadingUniversal, setLoadingUniversal] = useState(false);
 const [status, setStatus] = useState("");

 // Initialize SDK and crypto account
 useEffect( => {
const initializeSDK = async => {
 try {
const sdkInstance = createBaseAccountSDK({
 appName: "Sub Account Demo",
 appChainIds: [baseSepolia.id],
});

// Get the provider
const providerInstance = sdkInstance.getProvider;
setProvider(providerInstance);

setStatus("SDK initialized - ready to connect");
 } catch (error) {
console.error("SDK initialization failed:", error);
setStatus("SDK initialization failed");
 }
};

initializeSDK;
 }, []);

 const connectWallet = async => {
if (!provider) {
 setStatus("Provider not initialized");
 return;
}

setLoadingSubAccount(true);
setStatus("Connecting wallet...");

try {
 // Connect to the wallet
 const accounts = (await provider.request({
method: "eth_requestAccounts",
params: [],
 })) as string[];

 const universalAddr = accounts[0];
 setUniversalAddress(universalAddr);
 setConnected(true);

 // Check for existing sub account
 const response = (await provider.request({
method: "wallet_getSubAccounts",
params: [
 {
account: universalAddr,
domain: window.location.origin,
 },
],
 })) as GetSubAccountsResponse;

 const existing = response.subAccounts[0];
 if (existing) {
setSubAccount(existing);
setStatus("Connected! Existing Sub Account found");
 } else {
setStatus("Connected! No existing Sub Account found");
 }
} catch (error) {
 console.error("Connection failed:", error);
 setStatus("Connection failed");
} finally {
 setLoadingSubAccount(false);
}
 };

 const createSubAccount = async => {
if (!provider) {
 setStatus("Provider not initialized");
 return;
}

setLoadingSubAccount(true);
setStatus("Creating Sub Account...");

try {
 const newSubAccount = (await provider.request({
method: "wallet_addSubAccount",
params: [
 {
account: {
 type: 'create',
},
 }
],
 })) as WalletAddSubAccountResponse;

 setSubAccount(newSubAccount);
 setStatus("Sub Account created successfully!");
} catch (error) {
 console.error("Sub Account creation failed:", error);
 setStatus("Sub Account creation failed");
} finally {
 setLoadingSubAccount(false);
}
 };

 const sendCalls = useCallback(
async (
 calls: Array<{ to: string; data: string; value: string }>,
 from: string,
 setLoadingState: (loading: boolean) => void
) => {
 if (!provider) {
setStatus("Provider not available");
return;
 }

 setLoadingState(true);
 setStatus("Sending calls...");

 try {
const callsId = (await provider.request({
 method: "wallet_sendCalls",
 params: [
{
 version: "2.0",
 atomicRequired: true,
 chainId: `0x${baseSepolia.id.toString(16)}`, // Convert to hex
 from,
 calls,
 capabilities: {
 // https://docs.cdp.coinbase.com/paymaster/introduction/welcome
 // paymasterUrl: "your paymaster url",
 },
},
 ],
})) as string;

setStatus(`Calls sent! Calls ID: ${callsId}`);
 } catch (error) {
console.error("Send calls failed:", error);
setStatus("Send calls failed");
 } finally {
setLoadingState(false);
 }
},
[provider]
 );

 const sendCallsFromSubAccount = useCallback(async => {
if (!subAccount) {
 setStatus("Sub account not available");
 return;
}

const calls = [
 {
to: "0x4bbfd120d9f352a0bed7a014bd67913a2007a878",
data: "0x9846cd9e", // yoink
value: "0x0",
 },
];

await sendCalls(calls, subAccount.address, setLoadingSubAccount);
 }, [sendCalls, subAccount]);

 const sendCallsFromUniversal = useCallback(async => {
if (!universalAddress) {
 setStatus("Universal account not available");
 return;
}

const calls = [
 {
to: "0x4bbfd120d9f352a0bed7a014bd67913a2007a878",
data: "0x9846cd9e", // yoink
value: "0x0",
 },
];

await sendCalls(calls, universalAddress, setLoadingUniversal);
 }, [sendCalls, universalAddress]);

 return (
<div className="sub-account-demo">
 <h2>Sub Account Demo</h2>

 <div className="status">
<p>
 <strong>Status:</strong> {status}
</p>
{universalAddress && (
 <p>
<strong>Universal Account:</strong> {universalAddress}
 </p>
)}
{subAccount && (
 <p>
<strong>Sub Account:</strong> {subAccount.address}
 </p>
)}
 </div>

 <div className="actions">
{!connected ? (
 <button
onClick={connectWallet}
disabled={loadingSubAccount || !provider}
className="connect-btn"
 >
{loadingSubAccount ? "Connecting..." : "Connect Wallet"}
 </button>
) : !subAccount ? (
 <button
onClick={createSubAccount}
disabled={loadingSubAccount}
className="create-btn"
 >
{loadingSubAccount ? "Creating..." : "Add Sub Account"}
 </button>
) : (
 <div>
<button
 onClick={sendCallsFromSubAccount}
 disabled={loadingSubAccount}
 className="sub-account-btn"
>
 {loadingSubAccount ? "Sending..." : "Send Calls from Sub Account"}
</button>
<button
 onClick={sendCallsFromUniversal}
 disabled={loadingUniversal}
 className="universal-btn"
>
 {loadingUniversal
 ? "Sending..."
 : "Send Calls from Universal Account"}
</button>
 </div>
)}
 </div>

 <style jsx>{`.sub-account-demo {
 max-width: 600px;
 margin: 0 auto;
 padding: 20px;
 font-family: Arial, sans-serif;
}

.status {
 border-radius: 8px;
 margin: 20px 0;
}

.status p {
 margin: 5px 0;
}

.actions {
 margin: 20px 0;
}

.connect-btn,
.create-btn,
.sub-account-btn,
.universal-btn {
 background: #0052ff;
 color: white;
 border: none;
 padding: 12px 24px;
 border-radius: 8px;
 cursor: pointer;
 font-size: 16px;
 margin-right: 15px;
 margin-bottom: 10px;
}

.connect-btn:disabled,
.create-btn:disabled,
.sub-account-btn:disabled,
.universal-btn:disabled {
 background: #ccc;
 cursor: not-allowed;
}

.connect-btn:hover:not(:disabled),
.create-btn:hover:not(:disabled),
.sub-account-btn:hover:not(:disabled),
.universal-btn:hover:not(:disabled) {
 background: #0041cc;
}`}</style>
</div>
 );
}
```# Use Spend Permissions

> Learn how to use Spend Permissions to allow a trusted spender to spend user assets

## Overview

Spend Permissions let you designate a trusted`spender`that can move assets out of a user's Base Account on their behalf.

After the user signs the permission, the`spender`can initiate transfers within the limits you define — no additional prompts, pop-ups, or signatures needed from the user. This powers seamless experiences such as subscription renewals, algorithmic trading, and automated payouts.

Read more about the Spend Permission Manager contract and supported chains on [GitHub](https://github.com/coinbase/spend-permissions)

<Callout type="info">
 Spend Permissions for Base App Mini Apps are coming soon and will be supported in a future update.
</Callout>

<Note>
 If you're using Sub Accounts, learn how Base Account can automatically fund Sub Accounts and optionally skip approval prompts using [Auto Spend Permissions](/base-account/improve-ux/sub-accounts#auto-spend-permissions).
</Note>

## Usage

### Request a Spend Permission

You create an EIP-712 payload that describes the permission and ask the user to sign it. Store the resulting signature along with the permission data so you can register the permission on-chain later. The SDK helper below handles construction and signing for you.

| Field Name | Type | Description |
| ----------- | --------- | ---------------------------------------------------------------------------------------- |
|`account`|`address`| Smart account this spend permission is valid for |
|`spender`|`address`| Entity that can spend`account`'s tokens |
| `token`|`address`| Token address (ERC-7528 native token or ERC-20 contract) |
|`allowance`|`uint160`| Maximum allowed value to spend within each`period`|
|`period`|`uint48`| Time duration for resetting used`allowance`on a recurring basis (seconds) |
|`start`|`uint48`| Timestamp this spend permission is valid starting at (inclusive, unix seconds) |
|`end`|`uint48`| Timestamp this spend permission is valid until (exclusive, unix seconds) |
|`salt`|`uint256`| Arbitrary data to differentiate unique spend permissions with otherwise identical fields |
|`extraData`|`bytes`| Arbitrary data to attach to a spend permission which may be consumed by the`spender`|
#### Code```tsx
import { requestSpendPermission } from "@base-org/account/spend-permission";
import { createBaseAccountSDK } from "@base-org/account";
import { base } from "viem/chains";

const sdk = createBaseAccountSDK({
 appName: 'Base Account SDK Demo',
 appChainIds: [base.id],
});

const permission = await requestSpendPermission({
 account: "0x...",
 spender: "0x...",
 token: "0x...",
 chainId: 8453, // or any other supported chain
 allowance: 1_000_000n,
 periodInDays: 30,
 provider: sdk.getProvider,
});

console.log("Spend Permission:", permission);
```### Use the Spend Permission

Using a permission is 2 steps:

1. **Prepare the calls** — Call`prepareSpendCallData`with the permission and the requested`amount`.
2. **Submit the calls** — Submit the calls using your app's spender account.

`prepareSpendCallData`returns an array of calls needed to spend the tokens:

*`approveWithSignature`— When the permission is not yet registered onchain, this call would be prepended to the`spend`call.
*`spend`— The call to spend the tokens from the user's Base Account.
#### Code```tsx
import { prepareSpendCallData } from "@base-org/account/spend-permission";

// returns [approveWithSignatureCall, spendCall]
const spendCalls = await prepareSpendCallData({
 permission,
 amount, // optional; omit to spend the remaining allowance
});

// If your app spender account supports wallet_sendCalls, submit them in batch using wallet_sendCalls
// this is an example on how to do it using wallet_sendCalls in provider interface
await provider.request({
 method: "wallet_sendCalls",
 params: [
{
 version: "2.0",
 atomicRequired: true,
 from: spender,
 calls: spendCalls,
},
 ],
});

// If your app spender account doesn't support wallet_sendCalls, submit them in order using eth_sendTransaction
// this is an example on how to do it using eth_sendTransaction in provider interface
await Promise.all(
 spendCalls.map((call) =>
provider.request({
 method: "eth_sendTransaction",
 params: [
{
 ...call,
 from: spender,
},
 ],
})
 )
);
```<Note>
 **About the`spendCalls`array**

 This array has 2 calls when submitting the permission onchain for *the first time*.
 When the permission is already registered onchain, this array has only 1 call (the`spend`call).

 For most use cases, you don't need to worry about this.
</Note>

### Revoke a Spend Permission

You can revoke a permission in two ways:

* Request user approval via request to user's Base Account using`requestRevoke`.
* Revoke silently from your app's spender by submitting the call returned from `prepareRevokeCallData`.
#### Code
```tsx
import {
 requestRevoke,
 prepareRevokeCallData,
} from "@base-org/account/spend-permission";

// Option A: User-initiated revoke (wallet popup)
try {
 const hash = await requestRevoke(permission);
 console.log("Revoke succeeded", hash);
} catch {
 console.warn("Revoke was rejected or failed");
}

// Option B: Silent revoke by your app's spender account
const revokeCall = await prepareRevokeCallData(permission);

// Submit the revoke call using your app's spender account
// this is an example on how to do it using wallet_sendCalls in provider interface
await provider.request({
 method: "wallet_sendCalls",
 params: [
{
 version: "2.0",
 atomicRequired: true,
 from: spender,
 calls: [revokeCall],
},
 ],
});

// If your app spender account doesn't support wallet_sendCalls, submit the revoke call using eth_sendTransaction
// this is an example on how to do it using eth_sendTransaction in provider interface
await provider.request({
 method: "eth_sendTransaction",
 params: [
{
 ...revokeCall,
 from: spender,
},
 ],
});
```## API Reference

* [requestSpendPermission](/base-account/reference/spend-permission-utilities/requestSpendPermission)
* [prepareSpendCallData](/base-account/reference/spend-permission-utilities/prepareSpendCallData)
* [requestRevoke](/base-account/reference/spend-permission-utilities/requestRevoke)
* [prepareRevokeCallData](/base-account/reference/spend-permission-utilities/prepareRevokeCallData)
* [fetchPermissions](/base-account/reference/spend-permission-utilities/fetchPermissions)
* [fetchPermission](/base-account/reference/spend-permission-utilities/fetchPermission)
* [getPermissionStatus](/base-account/reference/spend-permission-utilities/getPermissionStatus)

## Complete Integration Example
#### Code```typescript
import {
 fetchPermissions,
 fetchPermission,
 getPermissionStatus,
 prepareSpendCallData,
 requestSpendPermission,
 requestRevoke,
 prepareRevokeCallData,
} from "@base-org/account/spend-permission";

import { createBaseAccountSDK } from "@base-org/account";
import { base } from "viem/chains";

const sdk = createBaseAccountSDK({
 appName: 'Base Account SDK Demo',
 appChainIds: [base.id],
});

const spender = "0xAppSpenderAddress";

// 1) Fetch a specific permission by its hash
// Use fetchPermission when you already know the permission hash
// (e.g., stored from a previous session or passed as a parameter)
const permission = await fetchPermission({
 permissionHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
 provider: sdk.getProvider,
});

// Alternative: Fetch all permissions for a spender
// Use fetchPermissions when you need to see all available permissions
// and want to choose which one to use
// const permissions = await fetchPermissions({
// account: "0xUserBaseAccountAddress",
// chainId: 84532,
// spender,
// provider: sdk.getProvider,
// });
// const permission = permissions.at(0);

// ========================================
// When there IS an existing permission
// ========================================

// 2. check the status of permission
try {
 const { isActive, remainingSpend } = await getPermissionStatus(permission);
 const amount = 1000n;

 if (!isActive || remainingSpend < amount) {
throw new Error("No spend permission available");
 }
} catch {
 throw new Error("No spend permission available");
}

// 3. prepare the calls
const [approveCall, spendCall] = await prepareSpendCallData({
 permission,
 amount,
});

// 4. execute the calls using your app's spender account
// this is an example using wallet_sendCalls, in production it could be using eth_sendTransaction.
await provider.request({
 method: "wallet_sendCalls",
 params: [
{
 version: "2.0",
 atomicRequired: true,
 from: spender,
 calls: [approveCall, spendCall],
},
 ],
});

// ========================================
// When there is NOT an existing permission
// ========================================

// 2. request a spend permission to use
const newPermission = await requestSpendPermission({
 account: "0xUserBaseAccountAddress",
 spender,
 token: "0xTokenContractAddress",
 chainId: 84532,
 allowance: 1_000_000n,
 periodInDays: 30,
 provider: sdk.getProvider,
});

// 3. prepare the calls
const spendCalls = await prepareSpendCallData({
 permission: newPermission,
 amount: 1_000n,
});

// 4. execute the calls using your app's spender account
// this is an example using eth_sendTransaction. If your app account supports wallet_sendCalls, use wallet_sendCalls to batch the calls instead.
await Promise.all(
 spendCalls.map((call) =>
provider.request({
 method: "eth_sendTransaction",
 params: [
{
 ...call,
 from: spender,
},
 ],
})
 )
);

// ========================================
// Request user to revoke spend permission
// ========================================

try {
 const hash = await requestRevoke(permission);
 console.log("Revoke succeeded", hash);
} catch {
 throw new Error("Revoke failed");
}

// ========================================
// Revoke spend permission in the background
// ========================================

const revokeCall = await prepareRevokeCallData(permission);

await provider.request({
 method: "wallet_sendCalls",
 params: [
{
 version: "2.0",
 atomicRequired: true,
 from: spender,
 calls: [revokeCall],
},
 ],
});
````

## Example Use Case

Let's say you're building an AI agent that can autonomously purchase [Zora Creator Coins](https://docs.zora.co/coins) using secure [Spend Permissions](/base-account/improve-ux/spend-permissions) on Base.

This example demonstrates how to combine Base Account's [Spend Permissions](/base-account/improve-ux/spend-permissions) with Coinbase Developer Platform (CDP) [Server Wallets](https://docs.cdp.coinbase.com/server-wallets/v2/introduction/quickstart) and [Trade API](https://docs.cdp.coinbase.com/trade-api/quickstart) for seamless, gas-free AI agent transactions.

- [Live Demo](https://base-agent-spend-permissions.vercel.app)

- [Source Code](https://github.com/base/demos/tree/master/base-account/agent-spend-permissions)

**Learn more:** [AI Agent with Spend Permissions](https://docs.base.org/cookbook/spend-permissions-ai-agent)

# Use Coinbase Balances Onchain

> How to use Coinbase balances onchain with Base Account

With MagicSpend, Base Account users can use their Coinbase balances onchain. This means users can easily start using onchain apps without needing to onramp funds into their wallet.

This also means that apps might not have all the balance information typically available to them by reading onchain data. Base Account indicates that this is the case by responding to [`wallet_getCapabilities`RPC calls](https://eip5792.xyz/reference/getCapabilities) with the`auxiliaryFunds`capability for each chain Base Account users can use their Coinbase balances on.

If your app supports Base Account, it should not assume it knows the full balances available to a user if the`auxiliaryFunds`capability is present on a given chain. For example, if your app disables a transaction button if it sees that the wallet has insufficient funds, your app should take`auxiliaryFunds`into account and enable the button if the account has`auxiliaryFunds`on the chain the user is transacting on.

## Why it matters

MagicSpend makes onboarding smoother by letting users pay gas or send funds even when their onchain wallet balance is **zero**. Your interface should therefore _never_ disable an action just because the onchain balance is insufficient.

1. Ensure you have the user’s`address` stored in your component state (from your wallet connection flow).

2. Drop the component below into your UI. It will check whether MagicSpend (`auxiliaryFunds`) is available for that address on Base and if not, disable the send button accordingly.

#### Code

````tsx
import { useEffect, useState } from "react";
import { createBaseAccountSDK, base } from "@base-org/account";

const sdk = createBaseAccountSDK({
 appName: "Magic Spend Demo",
 appChainIds: [base.constants.CHAIN_IDS.base],
});

const provider = sdk.getProvider;

interface Props {
 address?: string; // wallet address from your app state
}

export function SendButton({ address }: Props) {
 const [hasAuxFunds, setHasAuxFunds] = useState<boolean | null>(null);

 useEffect( => {
if (!address) return; // Wallet not connected yet

(async => {
 try {
const capabilities = await provider.request({
 method: "wallet_getCapabilities",
 params: [address],
});
const supported =
 capabilities?.[base.constants.CHAIN_IDS.base]?.auxiliaryFunds
?.supported ?? false;
setHasAuxFunds(supported);
 } catch (err) {
console.error("wallet_getCapabilities failed", err);
setHasAuxFunds(false);
 }
});
 }, [address]);

 const disabled = hasAuxFunds !== true;

 return (
<button disabled={disabled} onClick={ => console.log("Send!")}>
 {hasAuxFunds ? "Send Transaction" : "Insufficient Balance"}
</button>
 );
}
```### What the code does

1. Receives the current`address`from your own wallet logic.
2. Calls`wallet_getCapabilities`whenever the address changes.
3. Reads`auxiliaryFunds.supported` for the Base chain (`8453`).
4. Enables the button when MagicSpend is available; otherwise shows “Insufficient Balance”.

## Base Pay integrates Magic Spend by default

Thanks to [Magic Spend](/base-account/improve-ux/magic-spend), [Base Pay](/base-account/guides/accept-payments) allows users to pay with their USDC balance on Coinbase by default.


***

## Next steps

* Handle loading/error states if you need fine-grained UX
* Combine this check with your existing onchain balance logic for fallback flows



# Sign and Verify Typed Data

> EIP-712 structured data signing and verification for Base Account

## Overview

Base Account uses [Smart Wallet contracts](https://github.com/coinbase/smart-wallet) under the hood. Smart contract wallets introduce a few differences in how messages are signed compared to traditional Externally Owned Accounts (EOAs). This guide explains how to properly implement message signing using Base Account, covering both standard messages and typed data signatures, as well as some edge cases.

## Introduction

Before walking through the details of how to sign and verify messages using Base Account, it's important to understand some of the use cases of signing messages with wallets, as well as the key differences between EOAs and smart contracts when it comes to signing messages.

### Use Cases for Wallet Signatures

Blockchain-based apps use wallet signatures for two main categories:

1. **Signatures for offchain verification**: Used for authenticating users in onchain apps (e.g., Sign-In with Ethereum) to avoid spoofing. The signature is not used for any onchain action.

2. **Signatures for onchain verification**: Used for signing onchain permissions (e.g., [Permit2](https://github.com/Uniswap/permit2 or batching transactions. The signature is usually stored for future transactions.

### Smart Contract Wallet Differences

Smart contract wallets handle signatures differently from EOAs in several ways:

* The contract itself doesn't produce signatures - instead, the owner (e.g., passkey) signs messages
* Verification happens through the `isValidSignature`function defined in [EIP-1271](https://eips.ethereum.org/EIPS/eip-1271)
* Smart contract wallet addresses are often deterministic, allowing signature support before deployment via [ERC-6492](https://eips.ethereum.org/EIPS/eip-6492)

## High-level flow

In this guide, we'll walk through the high-level flow of signing and verifying messages using Base Account.```mermaid
sequenceDiagram
participant User
participant Browser
participant AppServer as "App Server"
participant SDK
participant Account

User->>Browser: Trigger signing action
Browser->>AppServer: GET /typed-data/prepare
AppServer-->>Browser: EIP-712 payload

Browser->>SDK: eth_signTypedData_v4
SDK->>Account: eth_signTypedData_v4(payload)
User->>Account: Review and approve signature
Account-->>SDK: signature
SDK-->>Browser: signature

Browser-->>AppServer: POST /typed-data/verify {payload, signature}
AppServer-->>Browser: verification result
```## Implementation

For the purposes of this guide, we'll use a simple example of a typed data payload that contains a permission
to spend user's funds (see [Spend Permissions](/base-account/improve-ux/spend-permissions))

### Code Snippets

<CodeGroup>
#### Code```ts
 import { createBaseAccountSDK } from "@base-org/account";

 // Initialize the SDK
 const provider = createBaseAccountSDK.getProvider;

 // 1 — Prepare the typed data payload
 const typedData = {
domain: {
 name: 'Spend Permission Manager',
 version: '1',
 chainId: 8453, // or any other supported chain
 verifyingContract: SPEND_PERMISSION_MANAGER_ADDRESS,
},
types: {
 SpendPermission: [
{ name: 'account', type: 'address' },
{ name: 'spender', type: 'address' },
{ name: 'token', type: 'address' },
{ name: 'allowance', type: 'uint160' },
{ name: 'period', type: 'uint48' },
{ name: 'start', type: 'uint48' },
{ name: 'end', type: 'uint48' },
{ name: 'salt', type: 'uint256' },
{ name: 'extraData', type: 'bytes' },
 ],
},
primaryType: 'SpendPermission',
message: spendPermissionData,
 };

 // 2 — Request signature from user
 try {
const accounts = await provider.request({
 method: 'eth_requestAccounts'
});

const signature = await provider.request({
 method: 'eth_signTypedData_v4',
 params: [accounts[0], JSON.stringify(typedData)]
});

// 3 — Send to backend for verification
const response = await fetch('/typed-data/verify', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
typedData,
signature,
address: accounts[0]
 })
});

const result = await response.json;
console.log('Verification result:', result);
 } catch (err) {
console.error('Signing failed:', err);
 }
```#### Code```ts
 import { createPublicClient, http } from 'viem';
 import { base } from 'viem/chains';

 const client = createPublicClient({
chain: base,
transport: http
 });

 export async function verifyTypedData(req, res) {
const { typedData, signature, address } = req.body;

try {
 // Verify the typed data signature
 const valid = await client.verifyTypedData({
address,
domain: typedData.domain,
types: typedData.types,
primaryType: typedData.primaryType,
message: typedData.message,
signature
 });

 if (!valid) {
return res.status(401).json({ error: 'Invalid signature' });
 }

 // Additional validation logic here
 // e.g., check expiry, nonce, permissions, etc.
 const now = Math.floor(Date.now / 1000);
 if (typedData.message.expiry < now) {
return res.status(401).json({ error: 'Signature expired' });
 }

 // Process the verified typed data
 res.json({
valid: true,
message: 'Signature verified successfully',
data: typedData.message
 });
} catch (error) {
 console.error('Verification error:', error);
 res.status(500).json({ error: 'Verification failed' });
}
 }
```</CodeGroup>

## Example Express Server
#### Code```ts
import express from 'express';
import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';

const app = express;
app.use(express.json);

const client = createPublicClient({
 chain: base,
 transport: http
});

// Simple nonce store (use Redis/DB in production)
const usedNonces = new Set<string>;

app.get('/typed-data/prepare', (req, res) => {
 const { userAddress, action, resource } = req.query;

 const nonce = Math.floor(Math.random * 1000000);
 const expiry = Math.floor(Date.now / 1000) + 3600; // 1 hour

 const typedData = {
// YOUR TYPED DATA HERE
 }

 res.json(typedData);
});

app.post('/typed-data/verify', async (req, res) => {
 const { typedData, signature, address } = req.body;

 try {
// 1. Check nonce hasn't been reused
const nonceKey = `${address}-${typedData.message.nonce}`;
if (usedNonces.has(nonceKey)) {
 return res.status(400).json({ error: 'Nonce already used' });
}

// 2. Check expiry
const now = Math.floor(Date.now / 1000);
if (typedData.message.expiry < now) {
 return res.status(400).json({ error: 'Signature expired' });
}

// 3. Verify signature
const valid = await client.verifyTypedData({
 address,
 domain: typedData.domain,
 types: typedData.types,
 primaryType: typedData.primaryType,
 message: typedData.message,
 signature
});

if (!valid) {
 return res.status(401).json({ error: 'Invalid signature' });
}

// 4. Mark nonce as used
usedNonces.add(nonceKey);

// 5. Process the verified action
res.json({
 valid: true,
 message: 'Typed data verified successfully',
 action: typedData.message.action,
 resource: typedData.message.resource
});
 } catch (error) {
console.error('Verification error:', error);
res.status(500).json({ error: 'Verification failed' });
 }
});

app.listen(3001, => console.log('Typed data server listening on :3001'));
```## Best Practices

### Domain Separation

Always use unique domain parameters to prevent signature replay across different applications:
#### Code```tsx
const domain = {
 name: 'Your App Name', // Unique app identifier
 version: '1', // Version your types
 chainId: 8453, // Network-specific
 verifyingContract: contractAddr // Contract that will verify
};
```### Nonce Management

Include nonces to prevent replay attacks:
#### Code```tsx
// Generate unique nonces
const nonce = crypto.randomBytes(16).toString('hex');

// Store and validate nonces server-side
const usedNonces = new Set; // Use Redis/DB in production
```### Expiry Times

Always include expiry timestamps for time-bound signatures:
#### Code```tsx
const expiry = Math.floor(Date.now / 1000) + 3600; // 1 hour
```# Pay Gas in ERC20 tokens

> Base Account enables users to pay for gas in ERC20 tokens

Base Account enables users to pay for gas in ERC20 tokens!
Tokens can be accepted for payment by passed in app paymasters in addition to a set of universally supported tokens, such as USDC (this set to be expanded soon).

This guide outlines how to set up your own app paymaster which will accept your token as payment.

### Choose a paymaster service provider

As a prerequisite, you'll need to obtain a paymaster service URL from a paymaster service provider. ERC20 paymasters have additional requirements that will be outlined below.

We recommend the [Coinbase Developer Platform](https://www.coinbase.com/developer-platform) paymaster as it is fully set up to work with Base Account ERC20 token gas payments out of the box. CDP is also offering up to \$15k in gas credits as part of the [Base Gasless Campaign](/base-account/more/base-gasless-campaign).

Otherwise if using a different paymaster provider, it must conform to the specification outlined in [ERC20 Compatible Paymasters](#erc20-compatible-paymasters) to correctly work with Base Account.

### App setup for custom token

Once you have a paymaster that is compatible with ERC20 gas payments on Base Account, you are only responsible for including the approvals to the paymaster for your token. It is recommended to periodically top up the allowance once they hit some threshold.
#### Code```js

const tokenDecimals = 6
const minTokenThreshold = 1 * 10 ** tokenDecimals // $1
const tokenApprovalTopUp = 20 * 10 ** tokenDecimals // $20
const tokenAddress = "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913"
const nftContractAddress = "0x66519FCAee1Ed65bc9e0aCc25cCD900668D3eD49"
const paymasterAddress = "0x2FAEB0760D4230Ef2aC21496Bb4F0b47D634FD4c"

const mintTo = {
 abi: abi,
 functionName: "mintTo",
 to: nftContractAddress,
 args: [account.address, 1],
};

calls = [mintTo]

// Checks for allowance
const allowance = await client.readContract({
 abi: parseAbi(["function allowance(address owner, address spender) returns (uint256)"]),
 address: tokenAddress,
 functionName: "allowance",
 args: [account.address, paymasterAddress],
})

if (allowance < minTokenThreshold) {
 // include approval for $20 in calls so that the paymaster will be able to move the token to accept payment
 calls.push({
abi: ["function approve(address,uint)"],
functionName: "approve",
to: nftContractAddress,
args: [paymasterAddress, tokenApprovalTopUp],
})
}
```That is it! Base Account will handle the rest as long as it is compatible as outlined below.

### ERC20 Compatible Paymasters

Coinbase Developer Platform is compatible out of the box and we will be working with other teams to include support soon!

The paymaster must handle the`pm_getPaymasterStubData`and`pm_getPaymasterData`JSON-RPC requests specified by ERC-7677 in addition to`pm_getAcceptedPaymentTokens`. We step through each request and response below.

#### pm\_getPaymasterStubData and pm\_getPaymasterData

1. The paymaster must use the specified ERC20 for payment if specified in the 7677 context field under `erc20`.
2. Upon rejection / failure the paymaster should return a `data`field in the JSONRPC response which could be used to approve the paymaster and includes:

*`acceptedTokens`array which is a struct including the token address
*`paymasterAddress`field which is the paymaster address which will perform the token transfers.

3. Upon success the paymaster must return a`tokenPayment`field in the result. This includes:

*`tokenAddress`address of the token used for payment
*`maxFee`the maximum fee to show in the UI
*`decimals`decimals to use in the UI
*`name`name of the token

Base Account will simulate the transaction to ensure success and accurate information.

##### Request

This is a standard V0.6 Entrypoint request example with the additional context for the specified token to be used.
#### JSON```json
{
 "jsonrpc": "2.0",
 "id": 1,
 "method": "pm_getPaymasterData",
 "params": [
{
 "sender": "0xe62B4aD6A7c079F47D77a9b939D5DC67A0dcdC2B",
 "nonce": "0x4e",
 "initCode": "0x",
 "callData": "0xb61d27f60000000000000000000000007746371e8df1d7099a84c20ed72e3335fb016b23000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000",
 "callGasLimit": "0x113e10",
 "verificationGasLimit": "0x113e10",
 "preVerificationGas": "0x113e10",
 "maxFeePerGas": "0x113e10",
 "maxPriorityFeePerGas": "0x113e10",
 "paymasterAndData": "0x",
 "signature": "0x5ee079a5dec73fe39c1ce323955fb1158fc1b9a6b2ddbec104cd5cfec740fa5531584f098b0ca95331b6e316bd76091e3ab75a7bc17c12488664d27caf19197e1c"
},
"0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
"0x2105",
{
 "erc20": "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913"
}
 ]
}
```##### Response

Successful response:
#### JSON```json
{
 "id": 1,
 "jsonrpc": "2.0",
 "result": {
"paymasterAndData": "0x2faeb0760d4230ef2ac21496bb4f0b47d634fd4c0000670fdc98000000000000494b3b6e1d074fbca920212019837860000100833589fcd6edb6e08f4c7c32d4f71b54bda029137746371e8df1d7099a84c20ed72e3335fb016b23000000000000000000000000000000000000000000000000000000009b75458400000000697841102cd520d4e0171a58dadc3e6086111a49a90826cb0ad25579f25f1652081f68c17d8652387a33bf8880dc44ecf95be4213e786566d755baa6299f477b0bb21c",
"tokenPayment": {
 "name": "USDC",
 "address": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
 "maxFee": "0xa7c8",
 "decimals": 6
}
 }
}
```Rejection response:
#### JSON```json
{
 "id": 1,
 "jsonrpc": "2.0",
 "error": {
"code": -32002,
"message": "request denied - no sponsorship and address can not pay with accepted token",
"data": {
 "acceptedTokens": [
{
 "name": "USDC",
 "address": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
}
 ]
}
 }
}
```#### pm\_getAcceptedPaymentTokens`pm_getAcceptedPaymentTokens`returns an array of tokens the paymaster will accept for payment.
The request contains the entrypoint and the chain id with optional context.

##### Request
#### JSON```json
{
 "jsonrpc": "2.0", "id": 1,
 "method": "pm_getAcceptedPaymentTokens",
 "params": [ "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789", "0x2105", {}]
}
```##### Response
#### JSON```json
{
 "id": 1,
 "jsonrpc": "2.0",
 "result": {
"acceptedTokens": [
 {
"name": "USDC",
"address": "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913"
 }
]
 }
}
```## FRAMEWORK INTEGRATIONS

Wagmi/Viem:

# Setup

> Configure Wagmi with Base Account connector for your React application

Learn how to set up Wagmi with Base Account to enable Base Account SDK functionality with familiar React hooks.

## Overview

[Wagmi](https://wagmi.sh/) is a collection of React hooks for Ethereum Virtual Machine (EVM) compatible networks that makes it easy to work with wallets, contracts, transactions, and signing. Base Account integrates perfectly with Wagmi, allowing you to use all your familiar hooks.


> Note:
To create a new wagmi project, you can use the command line`npm create wagmi@latest`.

## Installation

If you start [a new wagmi project](https://wagmi.sh/react/getting-started you can skip the installation step.

If you already have a project, you can install the dependencies with your package manager of choice:

<CodeGroup>
#### Command
```bash
 npm install wagmi viem @base-org/account
```#### Command```bash
 pnpm add wagmi viem @base-org/account
```#### Command```bash
 yarn add wagmi viem @base-org/account
```#### Command```bash
 bun add wagmi viem @base-org/account
```</CodeGroup>


> Note:
To get access to the latest version of the Base Account SDK within Wagmi, you can use the following command to override it:
#### Command```bash
 npm pkg set overrides.@base-org/account="latest"
```Or you can use a specific version by adding the version to the overrides:
#### Command```bash
 npm pkg set overrides.@base-org/account="2.2.0"
```Make sure to delete your`node_modules`and`package-lock.json`and run a new install to ensure the overrides are applied.

## Configuration

### 1. Configure Wagmi with Base Account

Create your Wagmi configuration with the Base Account connector configured for Base Account:
#### Code```typescript
// config/wagmi.ts
import { http, createConfig } from 'wagmi'
import { base } from 'wagmi/chains'
import { baseAccount } from 'wagmi/connectors'


export const config = createConfig({
 chains: [base],
 connectors: [
baseAccount({
 appName: 'Base App',
})
 ],
 transports: {
[base.id]: http
 },
})
```### 2. Wrap Your App

Wrap your application with the Wagmi provider:
#### Code```tsx
// app/layout.tsx or pages/_app.tsx
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config } from './config/wagmi'

const queryClient = new QueryClient

export default function App({ children }: { children: React.ReactNode }) {
 return (
<WagmiProvider config={config}>
 <QueryClientProvider client={queryClient}>
{children}
 </QueryClientProvider>
</WagmiProvider>
 )
}
```## Next Steps

Now that you have Wagmi configured with Base Account, you can:

* [Connect users with Sign in with Base](/base-account/framework-integrations/wagmi/sign-in-with-base)
* [Access the Base Account provider](/base-account/framework-integrations/wagmi/other-use-cases)







#### Ek Varyant 2



> Configure Privy with Base Account for your React application

export const GithubRepoCard = ({title, githubUrl}) => {
 return <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="mb-4 flex items-center rounded-lg bg-zinc-900 p-4 text-white transition-all hover:bg-zinc-800">
 <div className="flex w-full items-center gap-3">
 <svg height="24" width="24" className="flex-shrink-0 dark:fill-white" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg>
 <path fill="currentColor" fillRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
 </svg>

 <div className="flex min-w-0 flex-grow flex-col">
 <span className="truncate text-base font-medium">{title}</span>
 <span className="truncate text-xs text-zinc-400">{githubUrl}</span>
 </div>

 <svg className="h-5 w-5 flex-shrink-0 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
 </svg>
 </div>
 </a>;
};

Learn how to set up Privy with Base Account to enable seamless user authentication and wallet management.

## Overview

[Privy](https://www.privy.io/) provides user authentication and wallet management solutions for onchain applications.
By integrating Privy with Base Account,
you can access all the Privy hooks and methods
while having access to the users of Base Account.

### What you'll achieve

By the end of this guide, you will:

* Set up Privy with Base Account support
* Have Base Account set up as the main authentication option
* Be able to access Base Account SDK from Privy's React SDK

You can jump ahead and use the [Base Account Privy Template](https://github.com/base/base-account-privy) to get started.

<GithubRepoCard title="Base Account Privy Template" githubUrl="https://github.com/base/base-account-privy />

## Installation

### 1. Create a new Next.js project

<CodeGroup>
#### Command```bash
 npx create-next-app@latest base-account-privy
 cd base-account-privy
```#### Command```bash
 yarn create next-app base-account-privy
 cd base-account-privy
```</CodeGroup>

### 2. Override the Base Account SDK version

In order to access the latest version of the Base Account SDK, you need to override the Privy pinned version in your package.json file.

To do this, you can use the following command to override it:

<CodeGroup>
#### Command```bash
 npm pkg set overrides.@base-org/account="latest"
 # OR manually add to package.json:
 # "overrides": { "@base-org/account": "latest" }
```#### Command```bash
 # pnpm requires manual addition to package.json:
 # "pnpm": { "overrides": { "@base-org/account": "latest" } }
```#### Command```bash
 # yarn uses resolutions - add manually to package.json:
 # "resolutions": { "@base-org/account": "latest" }
```#### Command```bash
 # bun supports overrides - add manually to package.json:
 # "overrides": { "@base-org/account": "latest" }
```</CodeGroup>

Or you can use a specific version by adding the version to the overrides:

<CodeGroup>
#### Command```bash
 npm pkg set overrides.@base-org/account="2.2.0"
 # OR manually add to package.json:
 # "overrides": { "@base-org/account": "2.2.0" }
```#### Command```bash
 # pnpm requires manual addition to package.json:
 # "pnpm": { "overrides": { "@base-org/account": "2.2.0" } }
```#### Command```bash
 # yarn uses resolutions - add manually to package.json:
 # "resolutions": { "@base-org/account": "2.2.0" }
```#### Command```bash
 # bun supports overrides - add manually to package.json:
 # "overrides": { "@base-org/account": "2.2.0" }
```</CodeGroup>


> Note:
**If you're not starting a new projects**

 Make sure to delete your`node_modules`and`package-lock.json`and run a new install to ensure the overrides are applied.

### 3. Install the dependencies

Install the dependencies with your package manager of choice:

<CodeGroup>
#### Command```bash
 npm install @privy-io/react-auth @privy-io/chains @privy-io/wagmi-connector wagmi viem @base-org/account-ui react-toastify
```#### Command```bash
 pnpm add @privy-io/react-auth @privy-io/chains @privy-io/wagmi-connector wagmi viem @base-org/account-ui react-toastify
```#### Command```bash
 yarn add @privy-io/react-auth @privy-io/chains @privy-io/wagmi-connector wagmi viem @base-org/account-ui react-toastify
```#### Command```bash
 bun add @privy-io/react-auth @privy-io/chains @privy-io/wagmi-connector wagmi viem @base-org/account-ui react-toastify
```</CodeGroup>

## Configuration

### 1. Set up Environment Variables

Create a`.env.local`file in your project root:
#### Command```bash
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
```Get your Privy App ID from the [Privy Dashboard](https://dashboard.privy.io/)

### 2. Configure Privy Provider

Create your Privy configuration with Base Account as the default login method and update the layout to include the`PrivyProvider`.

<CodeGroup>
#### Code
```tsx
 "use client";

 import { PrivyProvider } from "@privy-io/react-auth";
 import { base } from "@privy-io/chains";

 export default function Providers({ children }: { children: React.ReactNode }) {
return (
 <PrivyProvider
appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
config={{
 appearance: {
walletList: ['base_account'],
showWalletLoginFirst: true
 },
 defaultChain: base,
}}
 >
{children}
 </PrivyProvider>
);
 }
```#### Code```tsx
 import type { Metadata } from "next";
 import { Geist, Geist_Mono } from "next/font/google";
 import "./globals.css";
 import Providers from "./providers";

 const geistSans = Geist({
variable: "--font-geist-sans",
subsets: ["latin"],
 });

 const geistMono = Geist_Mono({
variable: "--font-geist-mono",
subsets: ["latin"],
 });

 export const metadata: Metadata = {
title: "Privy Next demo",
description: "Generated by create next app",
 };

 export default function RootLayout({
children,
 }: Readonly<{
children: React.ReactNode;
 }>) {
return (
 <html lang="en">
<body
 className={`${geistSans.variable} ${geistMono.variable} antialiased`}
>
 <Providers>{children}</Providers>
</body>
 </html>
);
 }
```</CodeGroup>

## Usage

### 1. Update the App Page

Update the`app/page.tsx`file to show the authentication flow:
#### Code```tsx
"use client";

import { usePrivy } from "@privy-io/react-auth";
import { ToastContainer } from "react-toastify";

function Home {
 const { ready, authenticated, logout, login } = usePrivy;
 if (!ready) {
return <div>Loading...</div>;
 }

 return (
<div className="bg-white md:max-h-[100vh] md:overflow-hidden">
 {authenticated ? (
<section className="w-full flex flex-col md:flex-row md:h-[calc(100vh-60px)]">
 <div className="flex-grow overflow-y-auto h-full p-4 pl-8">
<button className="button" onClick={logout}>Logout</button>
 </div>
</section>
 ) : (
<section className="w-full flex flex-row justify-center items-center h-[calc(100vh-60px)] relative bg-gradient-to-b from-blue-600 to-blue-700">
 <div className="z-10 flex flex-col items-center justify-center w-full h-full px-4">
 <div className="flex h-10 items-center justify-center rounded-[20px] border border-white/20 bg-white/10 backdrop-blur-sm px-6 text-lg text-white font-abc-favorit">
Base × Privy Demo
 </div>
<div className="text-center mt-4 text-white text-7xl font-medium font-abc-favorit leading-[81.60px]">
 Build on Base
</div>
<div className="text-center text-white/90 text-xl font-normal leading-loose mt-8 max-w-2xl">
 Get started building on Base with Privy&apos;s authentication and native Base Account support
</div>
<button
 className="bg-white text-black mt-15 w-full max-w-md rounded-full px-4 py-2 font-medium hover:bg-gray-50 transition-colors lg:px-8 lg:py-4 lg:text-xl"
 onClick={ => {
 login;
 setTimeout( => {
 (document.querySelector('input[type="email"]') as HTMLInputElement)?.focus;
 }, 150);
 }}
>
 Get started
</button>
 </div>
</section>
 )}

 <ToastContainer
position="top-center"
autoClose={5000}
hideProgressBar
newestOnTop={false}
closeOnClick={false}
rtl={false}
pauseOnFocusLoss
draggable={false}
pauseOnHover
limit={1}
aria-label="Toast notifications"
style={{ top: 58 }}
 />
</div>
 );
}

export default Home;
```### 2. Run the project locally

You're done! You can now run the project locally:

<CodeGroup>
#### Command```bash
 npm run dev
```#### Command```bash
 pnpm dev
```#### Command```bash
 yarn dev
```#### Command```bash
 bun dev
```</CodeGroup>

You should see a page that looks like this:

<div style={{ display: 'flex', justifyContent: 'center'}}>
 ![](https://mintcdn.com/base-a060aa97/k2t1UOHQWAcdoYwb/images/base-account/Privy-Base-Account.png?fit=max&auto=format&n=k2t1UOHQWAcdoYwb&q=85&s=448e7791d71193b0f9f546bbcd328a98)
</div>

### 3. Get the Base Account SDK instance (Optional)

You can access the Base Account SDK from Privy using the`useBaseAccount`hook.
#### Code```tsx
import { useBaseAccountSdk } from '@privy-io/react-auth';

const { baseAccountSdk } = useBaseAccountSdk;

const provider = baseAccountSdk.getProvider;

const addresses = await provider.request({method: 'wallet_connect'});
```# Sign in with Base

> Implement Base Account authentication using the proper SIWE flow with Wagmi

Learn how to implement Sign in with Base using Wagmi by accessing the Base Account provider and following the proper SIWE (Sign-In With Ethereum) authentication flow.

## Prerequisites

Make sure you have [set up Wagmi with Base Account](/base-account/framework-integrations/wagmi/setup) before following this guide.

## Overview

To implement Sign in with Base with Wagmi, you need to:

1. Get the Base Account connector from Wagmi
2. Access the underlying provider from the connector
3. Use`wallet_connect`with`signInWithEthereum`capabilities
4. Verify the signature on your backend

This follows the same flow as shown in the [authenticate users guide](/base-account/guides/authenticate-users), but integrates with Wagmi's connector system.


> Note:
To get access to the latest version of the Base Account SDK within Wagmi, you can use the following command to override it:
#### Command```bash
 npm pkg set overrides.@base-org/account="latest"
```Or you can use a specific version by adding the version to the overrides:
#### Command```bash
 npm pkg set overrides.@base-org/account="2.2.0"
```Make sure to delete your`node_modules`and`package-lock.json`and run a new install to ensure the overrides are applied.

## Implementation

### Code Snippets

<CodeGroup>
#### Code```ts
 import { useState } from 'react'
 import { useConnect, useAccount, useDisconnect } from 'wagmi'
 import { baseAccount } from 'wagmi/connectors'

 export function SignInWithBase {
const [isLoading, setIsLoading] = useState(false)
const [error, setError] = useState<string | null>(null)
const { isConnected, address } = useAccount
const { connectAsync, connectors } = useConnect
const { disconnect } = useDisconnect

// Find the Base Account connector
const baseAccountConnector = connectors.find(
 connector => connector.id === 'baseAccount'
)

const handleSignIn = async => {
 if (!baseAccountConnector) {
setError('Base Account connector not found')
return
 }

 setIsLoading(true)
 setError(null)

 try {
// 1 — get a fresh nonce (generate locally or prefetch from backend)
const nonce = window.crypto.randomUUID.replace(/-/g, '')
// OR prefetch from server
// const nonce = await fetch('/auth/nonce').then(r => r.text)

// 2 — connect and get the provider
await connectAsync({ connector: baseAccountConnector })
const provider = baseAccountConnector.provider

// 3 — authenticate with wallet_connect
const authResult = await provider.request({
 method: 'wallet_connect',
 params: [{
version: '1',
capabilities: {
 signInWithEthereum: {
 nonce,
 chainId: '0x2105' // Base Mainnet - 8453
 }
}
 }]
})

const { accounts } = authResult
const { address, capabilities } = accounts[0]
const { message, signature } = capabilities.signInWithEthereum

// 4 — verify on backend
await fetch('/auth/verify', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ address, message, signature })
})
 } catch (err: any) {
console.error(`err ${err}`)
setError(err.message || 'Sign in failed')
 } finally {
setIsLoading(false)
 }
}

if (isConnected) {
 return (
<div className="flex items-center gap-4">
 <span className="font-mono text-sm">{address}</span>
 <button onClick={ => disconnect}>Sign Out</button>
</div>
 )
}

return (
 <button onClick={handleSignIn} disabled={isLoading}>
{isLoading ? 'Signing in...' : 'Sign in with Base'}
 </button>
)
 }
```#### Code```ts
 import { createPublicClient, http } from 'viem';
 import { base } from 'viem/chains';

 const client = createPublicClient({ chain: base, transport: http });

 export async function verifySig(req, res) {
const { address, message, signature } = req.body;
const valid = await client.verifyMessage({ address, message, signature });
if (!valid) return res.status(401).json({ error: 'Invalid signature' });
// create session / JWT
res.json({ ok: true });
 }
```</CodeGroup>

### 3. Using the Pre-built Button Component

You can also use the official [Sign In With Base](/base-account/reference/ui-elements/sign-in-with-base-button) button component:
#### Code```tsx
// components/SignInButton.tsx
import { SignInWithBaseButton } from '@base-org/account-ui/react'
import { useConnect } from 'wagmi'

export function SignInButton {
 const { connectAsync, connectors } = useConnect

 const handleSignIn = async => {
const baseAccountConnector = connectors.find(
 connector => connector.id === 'baseAccount'
)

if (!baseAccountConnector) return

try {
 // Generate nonce
 const nonce = window.crypto.randomUUID.replace(/-/g, '')

 // Connect and get provider
 await connectAsync({ connector: baseAccountConnector })
 const provider = baseAccountConnector.provider

 // Perform SIWE authentication
 const authResult = await provider.request({
method: 'wallet_connect',
params: [{
 version: '1',
 capabilities: {
signInWithEthereum: {
 nonce,
 chainId: '0x2105'
}
 }
}]
 })

 // Extract and verify signature
 const { accounts } = authResult
 const { address, capabilities } = accounts[0]
 const { message, signature } = capabilities.signInWithEthereum

 // Send to backend for verification
 await fetch('/auth/verify', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ address, message, signature })
 })
} catch (error) {
 console.error('Authentication failed:', error)
}
 }

 return (
<SignInWithBaseButton
 colorScheme="light"
 onClick={handleSignIn}
/>
 )
}
```> Warning:
**Please Follow the Brand Guidelines**

 If you intend on using the`SignInWithBaseButton`, please follow the [Brand Guidelines](/base-account/reference/ui-elements/brand-guidelines) to ensure consistency across your application.

# Base Pay

> Accept USDC payments with Base Pay in your Wagmi-powered React application

Base Pay works the same way in Wagmi applications as it does anywhere else - it operates independently of wallet connections and uses the Base Account SDK directly.

## Implementation

Base Pay doesn't require any special Wagmi integration. Simply follow the [Accept Payments guide](/base-account/guides/accept-payments) - all the code examples work exactly the same in your Wagmi app.

The key points:

* **No wallet connection needed** - Base Pay handles everything through the SDK
* **Same API** - Use `pay`and`getPaymentStatus`exactly as shown in the main guide
* **Works alongside Wagmi** - You can display the user's connected address from`useAccount`but it's not required for payments

## Quick Example
#### Code```tsx
import { pay } from '@base-org/account'
import { useAccount } from 'wagmi' // Optional - just for display

export function CheckoutButton {
 const { address } = useAccount // Optional

 const handlePayment = async => {
try {
 const payment = await pay({
amount: '5.00',
to: '0xYourAddress',
testnet: true
 })
 console.log('Payment sent:', payment.id)
} catch (error) {
 console.error('Payment failed:', error)
}
 }

 return (
<div>
 {address && <p>Connected: {address}</p>}
 <button onClick={handlePayment}>
Pay $5.00 with Base Pay
 </button>
</div>
 )
}
```> Warning:
**Please Follow the Brand Guidelines**

 If you intend on using the`BasePayButton`, please follow the [Brand Guidelines](/base-account/reference/ui-elements/brand-guidelines) to ensure consistency across your application.

## Learn More

For complete implementation details, examples, and advanced features like collecting user information, see the main [Accept Payments guide](/base-account/guides/accept-payments).


# Basenames

> Add support for Base names in your application using Wagmi and Viem

## Overview

Basenames are human-readable names for addresses on Base.
They are built on top of the ENS protocol and comply with [ENSIP-19](https://docs.ens.domains/ensip/19/)
To learn more about Basenames, check out the [Basenames FAQ](/base-account/basenames/basenames-faq).

This guide will show you how to add support for Basenames to your application using [Viem](https://viem.sh/)

## Usage

Use `getEnsName`to retrieve the primary ENS name for an address on Base:
#### Code```ts
import { createPublicClient, http, toCoinType } from 'viem'
import { base } from 'viem/chains'

const client = createPublicClient({
 chain: mainnet,
 transport: http(YOUR_PRIVATE_RPC_URL),
})

const name = await client.getEnsName({
 address: '0x179A862703a4adfb29896552DF9e307980D19285',
 coinType: toCoinType(base.id),
})
````

> Note:
> It is necessary to use a private RPC provider (`YOUR_PRIVATE_RPC_URL`) due to the computational demands associated with some of the ENSIP-19 resolution steps.

> Warning:
> There may be some latency between the initial registration of a Basename and the ability to resolve this name via ENSIP-19 due to the slow production of state proofs necessary for trustless resolution.

[Learn more about getEnsName →](https://viem.sh/docs/ens/actions/getEnsName)

#### Ek Varyant 2

> Decentralized naming system that allows users to register human-readable names (like 'alice.base.eth') on Base.

export const GithubRepoCard = ({title, githubUrl}) => {
return <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="mb-4 flex items-center rounded-lg bg-zinc-900 p-4 text-white transition-all hover:bg-zinc-800">

 <div className="flex w-full items-center gap-3">
 <svg height="24" width="24" className="flex-shrink-0 dark:fill-white" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg>
 <path fill="currentColor" fillRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
 </svg>

 <div className="flex min-w-0 flex-grow flex-col">
 <span className="truncate text-base font-medium">{title}</span>
 <span className="truncate text-xs text-zinc-400">{githubUrl}</span>
 </div>

 <svg className="h-5 w-5 flex-shrink-0 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
 </svg>
 </div>
 </a>;
};

You can find further documentation in the README of the repository below:

<GithubRepoCard title="Base Basenames" githubUrl="https://github.com/base/basenames />

# Other Use Cases

> Access the Base Account provider from Wagmi for advanced functionality like Sub Accounts, Spend Permissions, and more

Learn how to access the Base Account provider through Wagmi to unlock advanced Base Account features beyond basic authentication and payments.

## Prerequisites

Make sure you have [set up Wagmi with Base Account](/base-account/framework-integrations/wagmi/setup) before following this guide.

## Getting the Provider

The key to accessing advanced Base Account functionality is getting the provider from your Wagmi connector. Once you have the provider, you can use any Base Account RPC method.

<CodeGroup>
#### Code
```tsx
 // hooks/useBaseAccountProvider.ts
 import { useConnections } from 'wagmi'
 import { useEffect, useState } from 'react'
 import { EIP1193Provider } from 'viem'

export function useBaseAccountProvider {
const connections = useConnections
const [provider, setProvider] = useState<EIP1193Provider | null>(null)

useEffect( => {
const connection = connections[0]

if (!connection) {
setProvider(null)
return
}

connection.connector.getProvider.then((provider) => {
setProvider(provider as EIP1193Provider)
})
}, [connections])

return provider
}
`#### Code`tsx
// components/BaseAccountFeatures.tsx
import { useBaseAccountProvider } from '../hooks/useBaseAccountProvider'
import { useAccount } from 'wagmi'

export function BaseAccountFeatures {
const { address, isConnected } = useAccount
const provider = useBaseAccountProvider

const callProviderMethod = async (method: string, params: any[]) => {
if (!provider) {
console.error('Provider not available')
return
}

try {
const result = await provider.request({
method,
params
})
console.log(`${method} result:`, result)
return result
} catch (error) {
console.error(`${method} error:`, error)
throw error
}
}

if (!isConnected) {
return <p>Please connect your wallet to access Base Account features</p>
}

return (

 <div className="space-y-4">
<h2 className="text-xl font-bold">Base Account Features</h2>
<p className="text-gray-600">
 Connected with Base Account provider. You can now access advanced features.
</p>
 </div>
)
 }
```
</CodeGroup>

## Available Use Cases

Once you have the provider, you can access all Base Account functionality:

### Sub Accounts

Create and manage child accounts for improved UX.

**Learn more:** [Sub Accounts Guide](/base-account/improve-ux/sub-accounts) | [Sub Accounts RPC Method](/base-account/reference/core/provider-rpc-methods/wallet_addSubAccount)

### Spend Permissions

Allow apps to spend on behalf of users with predefined limits.

**Learn more:** [Spend Permissions Guide](/base-account/improve-ux/spend-permissions) | [Spend Permissions Reference](/base-account/reference/spend-permission-utilities/requestSpendPermission)

### Batch Transactions

Execute multiple transactions in a single user confirmation.

**Learn more:** [Batch Transactions Guide](/base-account/improve-ux/batch-transactions) | [`wallet_sendCalls` Reference](/base-account/reference/core/provider-rpc-methods/wallet_sendCalls)

### Gasless Transactions

Sponsor gas fees for your users.

**Learn more:** [Gasless Transactions Guide](/base-account/improve-ux/sponsor-gas/paymasters) | [Coinbase Developer Platform Paymaster](https://docs.cdp.coinbase.com/paymaster/introduction/welcome)

### Full list of provider methods and capabilities

Access the full list of Base Account provider methods and capabilities.

**Learn more:** [Provider RPC Methods](/base-account/reference/core/provider-rpc-methods/request-overview) | [Capabilities](/base-account/reference/core/capabilities/overview)

Privy:

# Auth (Sign In With Base)

> Manage user authentication with Privy and Base Account

export const GithubRepoCard = ({title, githubUrl}) => {
return <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="mb-4 flex items-center rounded-lg bg-zinc-900 p-4 text-white transition-all hover:bg-zinc-800">

 <div className="flex w-full items-center gap-3">
 <svg height="24" width="24" className="flex-shrink-0 dark:fill-white" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg>
 <path fill="currentColor" fillRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
 </svg>

 <div className="flex min-w-0 flex-grow flex-col">
 <span className="truncate text-base font-medium">{title}</span>
 <span className="truncate text-xs text-zinc-400">{githubUrl}</span>
 </div>

 <svg className="h-5 w-5 flex-shrink-0 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
 </svg>
 </div>
 </a>;
};

Learn how to handle authentication flows with Privy and Base Account, including both Privy-managed authentication and custom backend verification.

## Overview

Privy handles the initial authentication flow, managing user sessions and wallet connections. You can also implement additional authentication layers for enhanced security or custom requirements.

The code snippets in this guide are based on the following example project:

<GithubRepoCard title="Base Account Privy Template" githubUrl="https://github.com/base/base-account-privy />

## Authentication Flow

Privy manages the primary authentication before users enter your application:

<div style={{ display: 'flex', justifyContent: 'center'}}>
 ![](https://mintcdn.com/base-a060aa97/Pikf3vnaPhlKo52m/images/base-account/privy-base-auth.gif?s=106dddb8cd8b19436f791e1aae317671)
</div>

## Custom Authentication

For additional security or custom authentication requirements, you can implement backend verification using Sign-In with Ethereum (SIWE)
with the Base Account SDK.

### Setup

Follow the [Setup](/base-account/framework-integrations/privy/setup) guide to set up Privy with Base Account.

### Frontend Component (Sign In With Base)

We use the [`SignInWithBaseButton`](/base-account/reference/ui-elements/sign-in-with-base-button) component from the `@base-org/account-ui/react`package to make sure
we are following the brand guidelines.

<CodeGroup>
#### Code```tsx
 "use client";

import { useState } from "react";
import { useBaseAccountSdk } from "@privy-io/react-auth";
import { SignInWithBaseButton } from "@base-org/account-ui/react";

export const Authentication = => {
const { baseAccountSdk } = useBaseAccountSdk;
const [loading, setLoading] = useState(false);
const [verificationResult, setVerificationResult] = useState<any>(null);

const provider = baseAccountSdk?.getProvider;

const handleSignInWithBase = async => {
if (!provider) return;

try {
setLoading(true);

// Get a fresh nonce from backend
const nonceResponse = await fetch("/api/auth/nonce");
const { nonce } = await nonceResponse.json;

// Switch to Base Chain
await provider.request({
method: "wallet_switchEthereumChain",
params: [{ chainId: "0x2105" }],
});

// Connect and authenticate with SIWE
const response = (await provider.request({
method: "wallet_connect",
params: [{
version: "1",
capabilities: {
signInWithEthereum: {
nonce,
chainId: "0x2105",
},
},
}],
})) as {
accounts: {
address: string;
capabilities: {
signInWithEthereum: { signature: string; message: string };
};
}[];
};

const { address } = response.accounts[0];
const { message, signature } = response.accounts[0].capabilities.signInWithEthereum;

// Verify with backend
const verifyResponse = await fetch("/api/auth/verify", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ address, message, signature }),
});

const result = await verifyResponse.json;
setVerificationResult(result);
} catch (error) {
console.error("Sign in error:", error);
} finally {
setLoading(false);
}
};

return (

 <div>
<SignInWithBaseButton onClick={handleSignInWithBase} />
{verificationResult && (
 <div>✅ Backend Verified! Address: {verificationResult.address}</div>
)}
 </div>
);
 };

export default Authentication;

````</CodeGroup>

### Using the Authentication Component

Add the Authentication component to your page to enable Sign In with Base functionality:

<CodeGroup>
#### Code```tsx
 import Authentication from "@/components/sections/authentication";

 export default function Home {
return (
 <main className="flex min-h-screen flex-col items-center justify-center p-24">
<div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm">
 <h1 className="text-4xl font-bold text-center mb-8">
Base Account with Privy
 </h1>

 <div className="flex flex-col items-center space-y-4">
<Authentication />
 </div>
</div>
 </main>
);
 }
```#### Code```tsx
 "use client";

 import { usePrivy } from "@privy-io/react-auth";
 import Authentication from "@/components/sections/authentication";

 export default function Dashboard {
const { authenticated } = usePrivy;

if (!authenticated) {
 return (
<div className="flex min-h-screen items-center justify-center">
 <div className="text-center">
<h1 className="text-2xl font-bold mb-4">Access Required</h1>
<p className="mb-6">Please authenticate to access the dashboard.</p>
<Authentication />
 </div>
</div>
 );
}

return (
 <div className="min-h-screen p-8">
<h1 className="text-3xl font-bold mb-6">Dashboard</h1>
<p>Welcome to your authenticated dashboard!</p>
{/* Your protected content here */}
 </div>
);
 }
```</CodeGroup>

### Backend Implementation


> Warning:
**Development Only**: This backend implementation is not production-ready. The nonce management system needs proper persistence and security enhancements for production use.

<CodeGroup>
#### Code```ts
 import { NextResponse } from 'next/server';
 import crypto from 'crypto';
 import { nonceStore } from '@/lib/nonce-store';

 export async function GET {
try {
 const nonce = crypto.randomBytes(16).toString('hex');
 nonceStore.add(nonce);

 return NextResponse.json({ nonce });
} catch (error) {
 return NextResponse.json(
{ error: 'Failed to generate nonce' },
{ status: 500 }
 );
}
 }
```#### Code```ts
 import { NextRequest, NextResponse } from 'next/server';
 import { createPublicClient, http } from 'viem';
 import { base } from 'viem/chains';
 import { nonceStore } from '@/lib/nonce-store';

 const client = createPublicClient({
chain: base,
transport: http
 });

 export async function POST(request: NextRequest) {
try {
 const { address, message, signature } = await request.json;

 // Extract nonce from SIWE message
 const nonce = message.match(/Nonce: (\w+)/)?.[1];

 if (!nonce || !nonceStore.consume(nonce)) {
return NextResponse.json(
 { error: 'Invalid or reused nonce' },
 { status: 400 }
);
 }

 // Verify signature using viem
 const valid = await client.verifyMessage({
address: address as `0x${string}`,
message,
signature: signature as `0x${string}`});

 if (!valid) {
return NextResponse.json(
 { error: 'Invalid signature' },
 { status: 401 }
);
 }

 return NextResponse.json({
success: true,
address,
timestamp: new Date.toISOString
 });

} catch (error) {
 return NextResponse.json(
{ error: 'Internal server error' },
{ status: 500 }
 );
}
 }```#### Code```ts
 // Simple in-memory nonce store
 // In production, use Redis or a database
 class NonceStore {
private nonces = new Set<string>;

add(nonce: string): void {
 this.nonces.add(nonce);
}

consume(nonce: string): boolean {
 return this.nonces.delete(nonce);
}
 }

 export const nonceStore = new NonceStore;
```</CodeGroup>

### Production Considerations

For production deployments, enhance the backend implementation with:

* **Persistent storage**: Use Redis or a database instead of in-memory storage
* **Rate limiting**: Implement request rate limiting for nonce generation
* **Session management**: Create proper JWT tokens or session cookies
* **Nonce expiration**: Add timestamp-based nonce expiration


# Wallet Actions

> Sign messages, transactions, and typed data with Privy wallets

export const GithubRepoCard = ({title, githubUrl}) => {
 return <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="mb-4 flex items-center rounded-lg bg-zinc-900 p-4 text-white transition-all hover:bg-zinc-800">
 <div className="flex w-full items-center gap-3">
 <svg height="24" width="24" className="flex-shrink-0 dark:fill-white" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg>
 <path fill="currentColor" fillRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
 </svg>

 <div className="flex min-w-0 flex-grow flex-col">
 <span className="truncate text-base font-medium">{title}</span>
 <span className="truncate text-xs text-zinc-400">{githubUrl}</span>
 </div>

 <svg className="h-5 w-5 flex-shrink-0 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
 </svg>
 </div>
 </a>;
};

Learn how to perform wallet actions including signing messages, typed data, and transactions for EVM wallets using Privy.

## Overview

Privy provides comprehensive [wallet action hooks](https://docs.privy.io/wallets/using-wallets/ethereum/send-a-transaction) that work seamlessly with EVM (Ethereum-compatible) wallets. You can sign messages, typed data, raw hashes, and transactions, as well as send transactions directly.

### What you'll achieve

By the end of this guide, you will:

* Sign messages for EVM wallets
* Sign typed data (EIP-712) for structured data
* Send transactions on EVM networks

The code snippets in this guide are based on the following example project:

<GithubRepoCard title="Base Account Privy Template" githubUrl="https://github.com/base/base-account-privy />

## Implementation

### Component Setup

<CodeGroup>
#### Code```tsx
 "use client";

 import { useState, useMemo, useEffect } from "react";
 import {
useWallets,
useSendTransaction,
useSignMessage,
useSignTypedData,
 } from "@privy-io/react-auth";

 const WalletActions = => {
const { signMessage } = useSignMessage;
const { sendTransaction } = useSendTransaction;
const { signTypedData } = useSignTypedData;
const { wallets } = useWallets;

 const [selectedWallet, setSelectedWallet] = useState<{
 address: string;
 type: string;
 name: string;
} | null>(null);

// Map wallets for selection
const allWallets = useMemo( => {
 return wallets.map((wallet) => ({
address: wallet.address,
type: "ethereum",
name: wallet.address,
 }));
}, [wallets]);

useEffect( => {
 if (allWallets.length > 0 && !selectedWallet) {
setSelectedWallet(allWallets[0]);
 }
}, [allWallets, selectedWallet]);

const handleSignMessage = async => {
 if (!selectedWallet) return;

 try {
const message = "Hello, world!";
const { signature } = await signMessage(
 { message },
 { address: selectedWallet.address }
);
console.log("Message signed:", signature);
 } catch (error) {
console.error("Failed to sign message:", error);
 }
};


const handleSendTransaction = async => {
 if (!selectedWallet) return;

 try {
const transaction = await sendTransaction(
 {
to: "0xE3070d3e4309afA3bC9a6b057685743CF42da77C",
value: 10000
 },
 { address: selectedWallet.address }
);
console.log("Transaction sent:", transaction);
 } catch (error) {
console.error("Failed to send transaction:", error);
 }
};

const handleSignTypedData = async => {
 if (!selectedWallet) return;

 try {
const typedData = {
 domain: {
name: "Example App",
version: "1",
chainId: 1,
verifyingContract: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",
 },
 types: {
Person: [
 { name: "name", type: "string" },
 { name: "wallet", type: "address" },
],
Mail: [
 { name: "from", type: "Person" },
 { name: "to", type: "Person" },
 { name: "contents", type: "string" },
],
 },
 primaryType: "Mail",
 message: {
from: {
 name: "Alice",
 wallet: "0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826",
},
to: {
 name: "Bob",
 wallet: "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB",
},
contents: "Hello, Bob!",
 },
};

const { signature } = await signTypedData(typedData, {
 address: selectedWallet.address,
});
console.log("Typed data signature:", signature);
 } catch (error) {
console.error("Failed to sign typed data:", error);
 }
};

return (
 <div className="space-y-4">
{/* Wallet Selection */}
<div>
 <label className="block text-sm font-medium mb-2">Select wallet:</label>
 <select
value={selectedWallet?.address || ""}
onChange={(e) => {
 const wallet = allWallets.find((w) => w.address === e.target.value);
 setSelectedWallet(wallet || null);
}}
className="w-full p-2 border rounded-md"
 >
<option value="">Select a wallet</option>
{allWallets.map((wallet, index) => (
 <option key={index} value={wallet.address}>
 {wallet.address}
 </option>
))}
 </select>
</div>

{/* Action Buttons */}
<div className="grid grid-cols-3 gap-4">
 <button
onClick={handleSignMessage}
disabled={!selectedWallet}
className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
 >
Sign Message
 </button>
 <button
onClick={handleSignTypedData}
disabled={!selectedWallet}
className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
 >
Sign Typed Data
 </button>
 <button
onClick={handleSendTransaction}
disabled={!selectedWallet}
className="px-4 py-2 bg-red-600 text-white rounded disabled:opacity-50"
 >
Send Transaction
 </button>
</div>
 </div>
);
 };
```</CodeGroup>

### Wallet Actions

#### Sign Message

<CodeGroup>
#### Code```tsx
 const handleSignMessage = async => {
if (!selectedWallet) return;

try {
 const message = "Hello, world!";
 const { signature } = await signMessage(
{ message },
{ address: selectedWallet.address }
 );
 console.log("Signature:", signature);
} catch (error) {
 console.error("Failed to sign message:", error);
}
 };
```</CodeGroup>

#### Sign Typed Data (EIP-712)

<CodeGroup>
#### Code```tsx
 const handleSignTypedData = async => {
if (!selectedWallet) return;

try {
 const typedData = {
domain: {
 name: "Example App",
 version: "1",
 chainId: 1,
 verifyingContract: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",
},
types: {
 Person: [
{ name: "name", type: "string" },
{ name: "wallet", type: "address" },
 ],
 Mail: [
{ name: "from", type: "Person" },
{ name: "to", type: "Person" },
{ name: "contents", type: "string" },
 ],
},
primaryType: "Mail",
message: {
 from: {
name: "Alice",
wallet: "0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826",
 },
 to: {
name: "Bob",
wallet: "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB",
 },
 contents: "Hello, Bob!",
},
 };

 const { signature } = await signTypedData(typedData, {
address: selectedWallet.address,
 });
 console.log("Typed data signature:", signature);
} catch (error) {
 console.error("Failed to sign typed data:", error);
}
 };
```</CodeGroup>

#### Send Transaction

<CodeGroup>
#### Code```tsx
 const handleSendTransaction = async => {
if (!selectedWallet) return;

try {
 const transaction = await sendTransaction(
{
 to: "0xE3070d3e4309afA3bC9a6b057685743CF42da77C",
 value: 10000 // Wei
},
{ address: selectedWallet.address }
 );
 console.log("Transaction hash:", transaction);
} catch (error) {
 console.error("Failed to send transaction:", error);
}
 };
```</CodeGroup>

## Explore further

* [Privy docs](https://docs.privy.io/)
* [Batch Transactions](/base-account/improve-ux/batch-transactions)
* [Sponsor Gas](/base-account/improve-ux/sponsor-gas/paymasters)


# Sub Accounts

> Create and manage app-specific wallet accounts with Base Account

export const GithubRepoCard = ({title, githubUrl}) => {
 return <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="mb-4 flex items-center rounded-lg bg-zinc-900 p-4 text-white transition-all hover:bg-zinc-800">
 <div className="flex w-full items-center gap-3">
 <svg height="24" width="24" className="flex-shrink-0 dark:fill-white" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg>
 <path fill="currentColor" fillRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
 </svg>

 <div className="flex min-w-0 flex-grow flex-col">
 <span className="truncate text-base font-medium">{title}</span>
 <span className="truncate text-xs text-zinc-400">{githubUrl}</span>
 </div>

 <svg className="h-5 w-5 flex-shrink-0 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
 </svg>
 </div>
 </a>;
};

Learn how to create and manage Sub Accounts that provide app-specific wallet accounts embedded directly in your application.

## Overview

Sub Accounts allow you to provision dedicated wallet accounts for your users within your application.
These accounts are controlled by the user's main Base Account and provide an enhanced user experience
as the user's interactions produce no passkey prompts or popups.

Users can manage all their Sub Accounts at [account.base.app](https://account.base.app)

<Note>
 If you would like to see a live demo of Sub Accounts in action, check out our [Sub Accounts Demo](https://sub-accounts-fc.vercel.app)
</Note>

### What you'll achieve

By the end of this guide, you will:

* Understand how Sub Accounts work with Base Account
* Create new Sub Accounts for users
* Retrieve and manage existing Sub Accounts
* Implement Sub Account in your Privy project

The code snippets in this guide are based on the following example project:

<GithubRepoCard title="Base Account Privy Template" githubUrl="https://github.com/base/base-account-privy />

## Setup

Follow the [Setup](/base-account/framework-integrations/privy/setup) guide to set up Privy with Base Account.

## Implementation

### Component Setup

<CodeGroup>
#### Code```tsx
 "use client";

 import { useState, useMemo } from "react";
 import { useWallets } from "@privy-io/react-auth";

 const SubAccounts = => {
const { wallets } = useWallets;
const [subAccounts, setSubAccounts] = useState<
 {
address: string;
factory: string;
factoryData: string;
 }[]
>([]);
const [isLoading, setIsLoading] = useState(false);

// Find the Base Account wallet
const baseAccount = useMemo( => {
 return wallets.find((wallet) => wallet.walletClientType === 'base_account');
}, [wallets]);

const handleGetSubAccounts = async => {
 if (!baseAccount) return;

 setIsLoading(true);
 try {
// Switch to Base Sepolia (or Base Mainnet - use 8453 for mainnet)
await baseAccount.switchChain(84532);
const provider = await baseAccount.getEthereumProvider;

// Get existing Sub Accounts
const response = await provider.request({
 method: 'wallet_getSubAccounts',
 params: [{
account: baseAccount.address,
domain: window.location.origin
 }]
});

const { subAccounts: existingSubAccounts } = response;
setSubAccounts(existingSubAccounts || []);
 } catch (error) {
console.error("Error getting Sub Accounts:", error);
 } finally {
setIsLoading(false);
 }
};

const handleAddSubAccount = async => {
 if (!baseAccount) return;

 setIsLoading(true);
 try {
// Switch to Base Sepolia (or Base Mainnet - use 8453 for mainnet)
await baseAccount.switchChain(84532);
const provider = await baseAccount.getEthereumProvider;

// Create new Sub Account
await provider.request({
 method: 'wallet_addSubAccount',
 params: [{
version: '1',
account: {
 type: 'create',
 keys: [{
 type: 'address',
 publicKey: baseAccount.address
 }]
}
 }]
});

// Refresh the Sub Accounts list
await handleGetSubAccounts;
 } catch (error) {
console.error("Error creating Sub Account:", error);
 } finally {
setIsLoading(false);
 }
};

return (
 <div className="space-y-4">
<div className="flex gap-4">
 <button
onClick={handleGetSubAccounts}
disabled={!baseAccount || isLoading}
className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
 >
Get Sub Accounts
 </button>
 <button
onClick={handleAddSubAccount}
disabled={!baseAccount || isLoading}
className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
 >
Create Sub Account
 </button>
</div>

{subAccounts.length > 0 && (
 <div>
<h4 className="font-medium mb-2">Existing Sub Accounts:</h4>
<div className="space-y-2">
 {subAccounts.map((subAccount, index) => (
 <div key={index} className="p-3 border rounded-md">
 <p><strong>Address:</strong> {subAccount.address}</p>
 <p><strong>Factory:</strong> {subAccount.factory}</p>
 <p><strong>Factory Data:</strong> {subAccount.factoryData}</p>
 </div>
 ))}
</div>
 </div>
)}
 </div>
);
 };
```</CodeGroup>

### Key Methods

#### Getting Sub Accounts

Use`wallet_getSubAccounts`to retrieve existing Sub Accounts for a domain:
#### Code```tsx
const response = await provider.request({
 method: 'wallet_getSubAccounts',
 params: [{
account: baseAccount.address,
domain: window.location.origin
 }]
});
```#### Creating Sub Accounts

Use`wallet_addSubAccount`to create new Sub Accounts:
#### Code```tsx
await provider.request({
 method: 'wallet_addSubAccount',
 params: [{
version: '1',
account: {
 type: 'create',
 keys: [{
type: 'address',
publicKey: baseAccount.address
 }]
}
 }]
});
```### Network Configuration

Sub accounts work on both Base Mainnet and Base Sepolia:

* **Base Mainnet**: Chain ID`8453`* **Base Sepolia**: Chain ID`84532`### Explore further

* [Sub Accounts Guide](/base-account/improve-ux/sub-accounts)
* [Privy Sub Accounts Recipe](https://docs.privy.io/recipes/react/external-wallets/base-sub-accounts)



 COINBASE DEVELOPER PLATFORM

> Build onchain apps supporting both Base Account and CDP Embedded Wallets

# Integrate Base Account with CDP Embedded Wallets

Learn how to build an onchain app that seamlessly supports both **existing Base Account users** and **new users** through CDP Embedded Wallets, providing unified authentication and wallet management.

## Overview

This integration enables your app to serve two distinct user types:

* **Existing Base users**: Connect with their Base Account for a familiar experience
* **New onchain users**: Create CDP Embedded Wallets via email, mobile, or social authentication

Both user types get the same app functionality while using their preferred wallet type.

## What you'll build

* **Unified authentication flow**: Single sign-in supporting both wallet types
* **Automatic wallet detection**: Smart routing based on user's existing wallet status
* **Consistent user experience**: Both wallet types access the same app features

## Prerequisites

* Node.js 18+ installed
* React application (Next.js recommended)
* [CDP Portal account](https://portal.cdp.coinbase.com/) with Project ID
* Basic familiarity with Wagmi and React hooks

## Installation

Install the required packages for both CDP Embedded Wallets and Base Account support:
#### Command```bash
npm install @coinbase/cdp-core @coinbase/cdp-hooks @base-org/account @tanstack/react-query viem wagmi
```## Step-by-step implementation

Since native CDP + Base Account integration is under development, this guide uses a **dual connector approach** where both wallet types are supported through separate, coordinated connectors.

You can use the Base Account Wagmi connector alongside CDP's React provider system to create a unified experience that properly handles wallet persistence for both wallet types.

### Step 1: Environment configuration

Create environment variables for your CDP project:
#### Command```bash
# .env.local
NEXT_PUBLIC_CDP_PROJECT_ID=your_cdp_project_id
NEXT_PUBLIC_APP_NAME="Your App Name"
```Get your CDP Project ID from the [CDP Portal](https://portal.cdp.coinbase.com/)

⚠️ **Critical**: Without a valid`NEXT_PUBLIC_CDP_PROJECT_ID`, the app will fail to load with "Project ID is required" errors. Also configure your domain in CDP Portal → Wallets → Embedded Wallet settings for CORS.

### Step 2: Configure Wagmi for Base Account support

Set up Wagmi with the Base Account connector (embedded wallets will be handled separately via CDP React providers):
#### Code
```typescript
// config/wagmi.ts
import { createConfig, http } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { baseAccount } from 'wagmi/connectors';

// Base Account connector
const baseAccountConnector = baseAccount({
 appName: process.env.NEXT_PUBLIC_APP_NAME || 'Your App',
});

// Wagmi config (only for Base Account - embedded wallets handled by CDP React providers)
export const wagmiConfig = createConfig({
 connectors: [baseAccountConnector],
 chains: [baseSepolia, base], // Put baseSepolia first for testing
 transports: {
[base.id]: http,
[baseSepolia.id]: http,
 },
});
```### Step 3: Set up application providers

Wrap your application with the necessary providers. **Important**: Use`CDPHooksProvider`to properly manage embedded wallet authentication state:
#### Code```typescript
// app/layout.tsx
'use client';

import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CDPHooksProvider } from '@coinbase/cdp-hooks';
import { wagmiConfig } from '../config/wagmi';

const queryClient = new QueryClient;

export default function RootLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 return (
<html lang="en">
 <body>
<CDPHooksProvider
 config={{
projectId: process.env.NEXT_PUBLIC_CDP_PROJECT_ID!,
 }}
>
 <WagmiProvider config={wagmiConfig}>
<QueryClientProvider client={queryClient}>
 {children}
</QueryClientProvider>
 </WagmiProvider>
</CDPHooksProvider>
 </body>
</html>
 );
}
```### Step 4: Create unified authentication hook

Build a custom hook to manage both wallet types. Using`CDPHooksProvider`ensures users get their existing embedded wallets when they sign in again, rather than creating new ones each time.
#### Code```typescript
// hooks/useUnifiedAuth.ts
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useSignInWithEmail, useVerifyEmailOTP, useIsSignedIn, useEvmAddress, useSignOut } from '@coinbase/cdp-hooks';
import { useState, useEffect } from 'react';

export type WalletType = 'base_account' | 'embedded' | 'none';

export function useUnifiedAuth {
 // Wagmi hooks for Base Account
 const { address: wagmiAddress, isConnected: wagmiConnected, connector } = useAccount;
 const { connect, connectors } = useConnect;
 const { disconnect: wagmiDisconnect } = useDisconnect;

 // CDP hooks for embedded wallet - these work with CDPHooksProvider
 const { signInWithEmail, isLoading: isSigningIn } = useSignInWithEmail;
 const { verifyEmailOTP, isLoading: isVerifying } = useVerifyEmailOTP;
 const { isSignedIn: cdpSignedIn } = useIsSignedIn;
 const { evmAddress: cdpAddress } = useEvmAddress;
 const { signOut } = useSignOut;

 const [walletType, setWalletType] = useState<WalletType>('none');
 const [flowId, setFlowId] = useState<string>('');

 // Determine which wallet is active and prioritize the active one
 const address = wagmiConnected ? wagmiAddress : cdpAddress;
 const isConnected = wagmiConnected || cdpSignedIn;

 useEffect( => {
if (wagmiConnected && connector?.name === 'Base Account') {
 setWalletType('base_account');
} else if (cdpSignedIn && cdpAddress) {
 setWalletType('embedded');
} else {
 setWalletType('none');
}
 }, [wagmiConnected, cdpSignedIn, connector, cdpAddress]);

 const connectBaseAccount = => {
const baseConnector = connectors.find(c => c.name === 'Base Account');
if (baseConnector) {
 connect({ connector: baseConnector });
}
 };

 const signInWithEmbeddedWallet = async (email: string) => {
try {
 const response = await signInWithEmail({ email });

 // Capture flowId for OTP verification
 if (response && typeof response === 'object' && 'flowId' in response) {
setFlowId(response.flowId as string);
 }

 return true;
} catch (error) {
 console.error('Failed to sign in with email:', error);
 return false;
}
 };

 const verifyOtpAndConnect = async (otp: string) => {
try {
 // With CDPReactProvider, verifyEmailOTP automatically signs the user in
 await verifyEmailOTP({ flowId, otp });
 return true;
} catch (error) {
 console.error('Failed to verify OTP:', error);
 return false;
}
 };

 const disconnect = async => {
if (wagmiConnected) {
 wagmiDisconnect;
}

if (cdpSignedIn || walletType === 'embedded') {
 try {
await signOut;
 } catch (error) {
console.error('CDP sign out failed:', error);
 }
}
 };

 return {
address,
isConnected,
walletType,
connectBaseAccount,
signInWithEmbeddedWallet,
verifyOtpAndConnect,
disconnect,
isSigningIn,
isVerifying,
 };
}
```### Step 5: Build authentication component

Create a component that presents both authentication options:
#### Code```typescript
// components/WalletAuthButton.tsx
'use client';

import { useState } from 'react';
import { useUnifiedAuth } from '../hooks/useUnifiedAuth';

export function WalletAuthButton {
 const {
address,
isConnected,
walletType,
connectBaseAccount,
signInWithEmbeddedWallet,
verifyOtpAndConnect,
disconnect,
isSigningIn,
isVerifying,
 } = useUnifiedAuth;

 const [authStep, setAuthStep] = useState<'select' | 'email' | 'otp'>('select');
 const [email, setEmail] = useState('');
 const [otp, setOtp] = useState('');

 // Connected state
 if (isConnected && address) {
const walletDisplay = {
 base_account: { name: 'Base Account', icon: '🟦' },
 embedded: { name: 'Embedded Wallet', icon: '📱' },
}[walletType] || { name: 'Connected', icon: '✅' };

return (
 <div className="flex items-center space-x-3 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
<span>{walletDisplay.icon}</span>
<div>
 <div className="font-medium text-green-800">{walletDisplay.name}</div>
 <div className="text-xs text-green-600 font-mono">
{address.slice(0, 6)}...{address.slice(-4)}
 </div>
</div>
<button onClick={ => disconnect} className="text-sm text-red-600">
 Disconnect
</button>
 </div>
);
 }

 // OTP verification
 if (authStep === 'otp') {
return (
 <div className="space-y-4 p-4 border rounded-lg">
<div className="text-center">
 <h3 className="font-semibold">Check your email</h3>
 <p className="text-sm text-gray-600">Enter the code sent to {email}</p>
</div>

<input
 type="text"
 value={otp}
 onChange={(e) => setOtp(e.target.value)}
 placeholder="000000"
 maxLength={6}
 className="w-full px-3 py-2 border rounded text-center font-mono"
/>

<div className="space-y-2">
 <button
onClick={ => verifyOtpAndConnect(otp)}
disabled={otp.length !== 6 || isVerifying}
className="w-full px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
 >
{isVerifying ? 'Creating account...' : 'Verify & create account'}
 </button>

 <button
onClick={ => setAuthStep('email')}
className="w-full px-4 py-2 text-gray-600 hover:text-gray-800"
 >
Back
 </button>
</div>
 </div>
);
 }

 // Email input
 if (authStep === 'email') {
return (
 <div className="space-y-4 p-4 border rounded-lg">
<h3 className="font-semibold text-center">Create account</h3>

<input
 type="email"
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 placeholder="your@email.com"
 className="w-full px-3 py-2 border rounded"
/>

<div className="space-y-2">
 <button
onClick={async => {
 const success = await signInWithEmbeddedWallet(email);
 if (success) setAuthStep('otp');
}}
disabled={!email || isSigningIn}
className="w-full px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
 >
{isSigningIn ? 'Sending Code...' : 'Send Verification Code'}
 </button>

 <button
onClick={ => setAuthStep('select')}
className="w-full px-4 py-2 text-gray-600 hover:text-gray-800"
 >
Back
 </button>
</div>
 </div>
);
 }

 // Initial selection
 return (
<div className="space-y-3">
 <h2 className="text-xl font-bold text-center mb-4">Connect Your Wallet</h2>

 <button
onClick={connectBaseAccount}
className="w-full p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50"
 >
<div className="flex items-center space-x-3">
 <span className="text-2xl">🟦</span>
 <div className="text-left">
<div className="font-semibold">Sign in with Base</div>
<div className="text-sm text-gray-600">I have a Base Account</div>
 </div>
</div>
 </button>

 <button
onClick={ => setAuthStep('email')}
className="w-full p-4 border-2 border-gray-200 rounded-lg hover:bg-gray-50"
 >
<div className="flex items-center space-x-3">
 <span className="text-2xl">📱</span>
 <div className="text-left">
<div className="font-semibold">Create new account</div>
<div className="text-sm text-gray-600">Use email to get started</div>
 </div>
</div>
 </button>
</div>
 );
}
```### Step 6: Handle transactions for each wallet type

Create a transaction component that adapts to each wallet type:
#### Code```typescript
// components/SendTransaction.tsx
import { useState } from 'react';
import { parseEther } from 'viem';
import { useSendTransaction, useWaitForTransactionReceipt, useAccount, useSwitchChain } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { useUnifiedAuth } from '../hooks/useUnifiedAuth';

export function SendTransaction {
 const { address, walletType } = useUnifiedAuth;
 const { chain } = useAccount;
 const { switchChain } = useSwitchChain;
 const [amount, setAmount] = useState('');
 const [recipient, setRecipient] = useState('');

 const { data: hash, sendTransaction, isPending, error } = useSendTransaction;
 const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

 const handleTransaction = async => {
if (!address || !amount || !recipient) return;

try {
 sendTransaction({
to: recipient as `0x${string}`,
value: parseEther(amount),
 });
} catch (error) {
 console.error('Transaction failed:', error);
}
 };

 // Show different guidance based on wallet type
 const getTransactionGuidance = => {
switch (walletType) {
 case 'base_account':
return {
 title: 'Base Account Transaction',
 description: 'You\'ll be prompted to confirm with your passkey',
 icon: '🔐'
};
 case 'embedded':
return {
 title: 'Embedded Wallet Transaction',
 description: 'Transaction will be signed automatically',
 icon: '⚡'
};
 default:
return { title: 'Send Transaction', description: '', icon: '💸' };
}
 };

 const guidance = getTransactionGuidance;

 if (!address) return null;

 return (
<div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow">
 <div className="text-center mb-6">
<div className="text-3xl mb-2">{guidance.icon}</div>
<h3 className="text-lg font-bold">{guidance.title}</h3>
<p className="text-sm text-gray-600">{guidance.description}</p>

{/* Network indicator and switch */}
<div className="mt-3 p-2 bg-gray-50 rounded border">
 <div className="flex items-center justify-between">
<span className="text-sm">
 Network: <strong>{chain?.name || 'Unknown'}</strong>
</span>
<div className="space-x-1">
 {chain?.id !== baseSepolia.id && (
 <button
 onClick={ => switchChain({ chainId: baseSepolia.id })}
 className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
 >
 → Sepolia
 </button>
 )}
 {chain?.id !== base.id && (
 <button
 onClick={ => switchChain({ chainId: base.id })}
 className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
 >
 → Mainnet
 </button>
 )}
</div>
 </div>
</div>
 </div>

 <div className="space-y-4">
<div>
 <label className="block text-sm font-medium mb-1">Amount (ETH)</label>
 <input
type="number"
value={amount}
onChange={(e) => setAmount(e.target.value)}
placeholder="0.001"
step="0.001"
className="w-full px-3 py-2 border border-gray-300 rounded"
 />
</div>

<div>
 <label className="block text-sm font-medium mb-1">To Address</label>
 <input
type="text"
value={recipient}
onChange={(e) => setRecipient(e.target.value)}
placeholder="0x..."
className="w-full px-3 py-2 border border-gray-300 rounded font-mono text-sm"
 />
</div>

{error && (
 <div className="p-3 bg-red-50 border border-red-200 rounded">
<p className="text-sm text-red-800">Error: {error.message}</p>
 </div>
)}

<button
 onClick={handleTransaction}
 disabled={!amount || !recipient || isPending || isConfirming}
 className="w-full px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
>
 {isPending || isConfirming ? 'Processing...' : 'Send Transaction'}
</button>

{isSuccess && hash && (
 <div className="p-3 bg-green-50 border border-green-200 rounded text-center">
<p className="text-green-800 font-medium mb-2">✅ Transaction Confirmed!</p>
<a
 href={`https://${chain?.id === baseSepolia.id ? 'sepolia.' : ''}basescan.org/tx/${hash}`}
 target="_blank"
 rel="noopener noreferrer"
 className="text-blue-600 hover:text-blue-800 text-sm underline"
>
 View on {chain?.id === baseSepolia.id ? 'Sepolia ' : ''}Basescan →
</a>
 </div>
)}
 </div>
</div>
 );
}
```### Step 7: Complete your app

Put everything together in your main application:
#### Code```typescript
// app/page.tsx
'use client';

import { WalletAuthButton } from '../components/WalletAuthButton';
import { SendTransaction } from '../components/SendTransaction';
import { useAccount } from 'wagmi';

export default function HomePage {
 const { isConnected } = useAccount;

 return (
<div className="min-h-screen bg-gray-50 py-12 px-4">
 <div className="max-w-2xl mx-auto">
<div className="text-center mb-8">
 <h1 className="text-3xl font-bold mb-2">CDP + Base Account Demo</h1>
 <p className="text-gray-600">
One app supporting both Base Account and embedded wallet users
 </p>
</div>

<div className="space-y-6">
 <WalletAuthButton />
 {isConnected && <SendTransaction />}
</div>
 </div>
</div>
 );
}
```## Troubleshooting

### Common Issues

**Base Account connector not appearing**

* Verify the Base Account SDK,`@base-org/account`, is installed and up-to-date
* Check wagmi configuration includes Base Account connector
* Ensure app is running on Base or Base Sepolia network

**CDP Embedded Wallet authentication failing**

* Verify CDP Project ID is correct in environment variables
* **Critical**: Add your domains (e.g., `http://localhost:3000` `http://localhost:3001`to CDP Portal → Wallets → Embedded Wallet settings → Allowed domains
* Ensure all required CDP packages (see above) are installed

**New wallet created each time instead of signing into existing wallet**

* Ensure you're using`CDPHooksProvider`with proper config in your layout
* Verify CDP Project ID is correctly configured
* Check that hooks are imported from`@coinbase/cdp-hooks`consistently

**Users can't switch between wallet types**

* Implement proper disconnect flow before connecting different type
* Clear any cached authentication state when switching
* Provide clear UI guidance for wallet type selection

## Enhanced integration coming soon

We are actively working on native Base Account integration with CDP Embedded Wallets that will enable:

* **Unified connector**: Single CDP connector to handle both wallet types seamlessly
* **Spend permissions**: Sub Accounts will be able to access parent Base Account balance with limits
* **Sub Account creation**: Base Account users will be able to create app-specific Sub Accounts

## Resources

* [CDP Embedded Wallets Documentation](https://docs.cdp.coinbase.com/embedded-wallets/)
* [CDP React Components Documentation](https://docs.cdp.coinbase.com/embedded-wallets/components)
* [Base Account Wagmi Setup](/base-account/framework-integrations/wagmi/setup)
* [CDP Portal](https://portal.cdp.coinbase.com/)
* [Wagmi Documentation](https://wagmi.sh/)

Monitor the [CDP documentation](https://docs.cdp.coinbase.com/) for updates on enhanced Embedded Wallet Base Account integration features.


# RainbowKit

> Integrate Base Account with RainbowKit

export const GithubRepoCard = ({title, githubUrl}) => {
 return <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="mb-4 flex items-center rounded-lg bg-zinc-900 p-4 text-white transition-all hover:bg-zinc-800">
 <div className="flex w-full items-center gap-3">
 <svg height="24" width="24" className="flex-shrink-0 dark:fill-white" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg>
 <path fill="currentColor" fillRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
 </svg>

 <div className="flex min-w-0 flex-grow flex-col">
 <span className="truncate text-base font-medium">{title}</span>
 <span className="truncate text-xs text-zinc-400">{githubUrl}</span>
 </div>

 <svg className="h-5 w-5 flex-shrink-0 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
 </svg>
 </div>
 </a>;
};

## Overview

[RainbowKit](https://www.rainbowkit.com/) is a React library that makes it easy to add wallet sign-in to your onchain application. It's designed to work out-of-the-box and includes native support for Base Account.

By integrating RainbowKit with Base Account, you can provide your users with a seamless onboarding experience while maintaining access to the full Base Account feature set.

### What you'll achieve

By the end of this guide, you will:

* Set up RainbowKit with Base Account support
* Learn how to use both`ConnectButton`and`WalletButton`components
* Configure your app to prioritize Base Account as the primary wallet option
* Obtain and configure a Reown project ID (required for RainbowKit projects)

You can jump ahead and use the Base Account RainbowKit Template to get started:

<GithubRepoCard title="Base Account RainbowKit Template" githubUrl="https://github.com/base/demos/tree/master/base-account/base-account-rainbow-template />

## Installation

After [creating a new Next.js project](https://nextjs.org/docs/app/getting-started/installation install the required dependencies:

<CodeGroup>
#### Command```bash
 npm install @rainbow-me/rainbowkit wagmi viem @tanstack/react-query
```#### Command```bash
 pnpm add @rainbow-me/rainbowkit wagmi viem @tanstack/react-query
```#### Command```bash
 yarn add @rainbow-me/rainbowkit wagmi viem @tanstack/react-query
```#### Command```bash
 bun add @rainbow-me/rainbowkit wagmi viem @tanstack/react-query
```</CodeGroup>


> Note:
**Access the latest version of the Base Account SDK (Recommended)**

 It is {<u>HIGHLY RECOMMENDED</u>} to access the latest version of the Base Account SDK in order to get the latest features and bug fixes.

 To do this, you can use the following command to override it:

 <CodeGroup>
#### Command```bash
npm pkg set overrides.@base-org/account="latest"
# OR manually add to package.json:

# "overrides": { "@base-org/account": "latest" }
```#### Command```bash


<!-- MERGED: additional variant 2 for ""overrides": { "@base-org/account": "latest" }" -->

```</CodeGroup>

 Or you can use a specific version by adding the version to the overrides:

 <CodeGroup>
#### Command```bash
npm pkg set overrides.@base-org/account="2.2.0"
# pnpm requires manual addition to package.json:

# "pnpm": { "overrides": { "@base-org/account": "latest" } }
```#### Command```bash
# yarn uses resolutions - add manually to package.json:

# "resolutions": { "@base-org/account": "latest" }
```#### Command```bash
# bun supports overrides - add manually to package.json:

# "overrides": { "@base-org/account": "2.2.0" }
```#### Command```bash


<!-- MERGED: additional variant 2 for ""overrides": { "@base-org/account": "2.2.0" }" -->

```</CodeGroup>

 Make sure to delete your`node_modules`and`package-lock.json`and run a new install to ensure the overrides are applied.

## Get Your Reown Project ID

Before you can use RainbowKit with Base Account, you need to obtain a project ID from Reown Cloud.

1. Visit [Reown Cloud Dashboard](https://dashboard.reown.com/)
2. Sign up for a free account or log in if you already have one
3. Create a new project and copy the project ID.

## Configuration

### 1. Configure Wagmi with RainbowKit

Create a`wagmi.ts`file in your`src`directory to configure your blockchain connections and wallet options:
#### Code```tsx
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
 base,
 mainnet
} from 'wagmi/chains';

export const config = getDefaultConfig({
 appName: 'My Base Account App',
 projectId: 'YOUR_PROJECT_ID', // Replace with your Reown project ID
 chains: [
mainnet,
base
 ],
 ssr: true, // Enable server-side rendering support
});
```> Warning:
**Replace YOUR\_PROJECT\_ID**

 Make sure to replace`'YOUR_PROJECT_ID'`with the actual project ID you obtained from [Reown Cloud](https://dashboard.reown.com/)

 For production applications, use environment variables:
#### Code```typescript
 projectId: process.env.NEXT_PUBLIC_REOWN_PROJECT_ID!,
```And add to your`.env.local`:
#### Command
```bash
 NEXT_PUBLIC_REOWN_PROJECT_ID=your_project_id_here
```### 2. Set up RainbowKit Provider

Wrap your application with the necessary providers in your`_app.tsx`:
#### Code
```tsx
import '../styles/global.css';
import '@rainbow-me/rainbowkit/styles.css';
import type { AppProps } from 'next/app';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';

import { config } from '../wagmi';

const queryClient = new QueryClient;

function MyApp({ Component, pageProps }: AppProps) {
 return (
<WagmiProvider config={config}>
 <QueryClientProvider client={queryClient}>
<RainbowKitProvider>
 <Component {...pageProps} />
</RainbowKitProvider>
 </QueryClientProvider>
</WagmiProvider>
 );
}

export default MyApp;
```## Usage

RainbowKit provides two main components for wallet connections:`ConnectButton`and`WalletButton`. Both components support Base Account out of the box.

### Option 1: Using ConnectButton

The `ConnectButton`is RainbowKit's all-in-one wallet connection component. It displays the wallet connection modal with all available wallets, including Base Account.
#### Code```tsx
import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { NextPage } from 'next';

const Home: NextPage = => {
 return (
<div
 style={{
display: 'flex',
justifyContent: 'flex-end',
padding: 12,
 }}
>
 <ConnectButton />
</div>
 );
};

export default Home;
```When implemented, this is what it will look like:


### Option 2: Using WalletButton for Base Account

The`WalletButton`component provides a direct connection to a specific wallet. This is ideal when you want to highlight Base Account as the primary wallet option.
#### Code```tsx
import { WalletButton } from '@rainbow-me/rainbowkit';
import type { NextPage } from 'next';

const Home: NextPage = => {
 return (
<div
 style={{
display: 'flex',
justifyContent: 'flex-end',
padding: 12,
 }}
>
 <WalletButton wallet="baseAccount" />
</div>
 );
};

export default Home;
```When implemented, this is what it will look like:


## Advanced Configuration

### Prioritize Base Account in Wallet List

To make Base Account appear first in the wallet connection modal, you can customize the wallet order:
#### Code```tsx
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { base, mainnet, sepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
 appName: 'My Base Account App',
 projectId: process.env.NEXT_PUBLIC_REOWN_PROJECT_ID!,
 chains: [base, mainnet, sepolia],
 ssr: true,
 // Wallet configuration
 wallets: [
{
 groupName: 'Recommended',
 wallets: ['baseAccount'], // Base Account appears first
},
 ],
});
```### Customize RainbowKit Theme

RainbowKit supports extensive theming options:
#### Code```tsx
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';

function MyApp({ Component, pageProps }: AppProps) {
 return (
<WagmiProvider config={config}>
 <QueryClientProvider client={queryClient}>
<RainbowKitProvider
 theme={darkTheme({
accentColor: '#0052FF', // Base blue
accentColorForeground: 'white',
borderRadius: 'medium',
 })}
>
 <Component {...pageProps} />
</RainbowKitProvider>
 </QueryClientProvider>
</WagmiProvider>
 );
}
```### Access Wallet Connection State

Use wagmi hooks to access wallet connection state throughout your app:
#### Code```tsx
import { useAccount, useDisconnect, useEnsName } from 'wagmi';

function Profile {
 const { address, isConnected } = useAccount;
 const { disconnect } = useDisconnect;
 const { data: ensName } = useEnsName({ address });

 if (!isConnected) return <div>Not connected</div>;

 return (
<div>
 <p>Connected to {ensName ?? address}</p>
 <button onClick={ => disconnect}>Disconnect</button>
</div>
 );
}
```### Switch Networks Programmatically

Allow users to switch between different chains:
#### Code```tsx
import { useSwitchChain } from 'wagmi';
import { base, mainnet } from 'wagmi/chains';

function NetworkSwitcher {
 const { switchChain } = useSwitchChain;

 return (
<div>
 <button onClick={ => switchChain({ chainId: base.id })}>
Switch to Base
 </button>
 <button onClick={ => switchChain({ chainId: mainnet.id })}>
Switch to Mainnet
 </button>
</div>
 );
}
```## Best Practices


- Use Environment Variables



- Enable SSR Support



- Prioritize Base Chain



- Keep Dependencies Updated


## Next Steps

Now that you have RainbowKit configured with Base Account, you can:



- [Explore Base Account Features](https://docs.base.org/base-account/overview/what-is-base-account)



- [Explore RainbowKit Docs](https://www.rainbowkit.com/docs/introduction)



- [Explore Wagmi Docs](https://wagmi.sh/react/api/hooks)



- Join the Base Community




# "pnpm": { "overrides": { "@base-org/account": "2.2.0" } }```#### Command```bash
# "resolutions": { "@base-org/account": "2.2.0" }
```#### Command```bash
# Dynamic

> Integrate Base Account with Dynamic

We are working with [Dynamic](https://www.dynamic.xyz/) to integrate Base Account with their SDK.

A full guide and example will be available soon.
In the meantime, you can use the connector from the [Wagmi guide](/base-account/framework-integrations/wagmi/setup)
with [Dynamic+Wagmi](https://www.dynamic.xyz/docs/react-sdk/using-wagmi) as a workaround.




## REFERANCE

Account SDK:

# createBaseAccountSDK

> Create a Base Account SDK instance with EIP-1193 compliant provider

export const Button = ({children, disabled, variant = "primary", size = "medium", iconName, roundedFull = false, className = '', fullWidth = false, onClick = undefined}) => {
 const variantStyles = {
 primary: 'bg-blue text-black border border-blue hover:bg-blue-80 active:bg-[#06318E] dark:text-white',
 secondary: 'bg-white border border-white text-palette-foreground hover:bg-zinc-15 active:bg-zinc-30',
 outlined: 'bg-transparent text-white border border-white hover:bg-white hover:text-black active:bg-[#E3E7E9]'
 };
 const sizeStyles = {
 medium: 'text-md px-4 py-2 gap-3',
 large: 'text-lg px-6 py-4 gap-5'
 };
 const sizeIconRatio = {
 medium: '0.75rem',
 large: '1rem'
 };
 const classes = ['text-md px-4 py-2 whitespace-nowrap', 'flex items-center justify-center', 'disabled:opacity-40 disabled:pointer-events-none', 'transition-all', variantStyles[variant], sizeStyles[size], roundedFull ? 'rounded-full' : 'rounded-lg', fullWidth ? 'w-full' : 'w-auto', className];
 const buttonClasses = classes.filter(Boolean).join(' ');
 const iconSize = sizeIconRatio[size];
 return <button type="button" disabled={disabled} className={buttonClasses} onClick={onClick}>
 <span>{children}</span>
 {iconName && <Icon name={iconName} width={iconSize} height={iconSize} color="currentColor" />}
 </button>;
};

export const BaseBanner = ({content = null, id, dismissable = true}) => {
 const LOCAL_STORAGE_KEY_PREFIX = 'cb-docs-banner';
 const [isVisible, setIsVisible] = useState(false);
 const onDismiss = => {
 localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}-${id}`, 'false');
 setIsVisible(false);
 };
 useEffect( => {
 const storedValue = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}-${id}`);
 setIsVisible(storedValue !== 'false');
 }, []);
 if (!isVisible) {
 return null;
 }
 return <div className="fixed bottom-0 left-0 right-0 bg-white py-8 px-4 lg:px-12 z-50 text-black dark:bg-black dark:text-white border-t dark:border-gray-95">
 <div className="flex items-center max-w-8xl mx-auto">
 {typeof content === 'function' ? content({
 onDismiss
 }) : content}
 {dismissable && <button onClick={onDismiss} className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" aria-label="Dismiss banner">
 ✕
 </button>}
 </div>
 </div>;
};

Defined in the [Base Account SDK](https://github.com/base/account-sdk)

<Info>
 Creates a Base Account SDK instance that provides an EIP-1193 compliant Ethereum provider and additional account management functionality. This is the primary entry point for integrating Base Account into your application.
</Info>

## Parameters

<ParamField body="params" type="CreateProviderOptions" required>
 Configuration options for creating the SDK instance.

 <Expandable title="CreateProviderOptions properties">
 <ParamField body="appName" type="string">
 The name of your application. Defaults to "App" if not provided.
 </ParamField>

 <ParamField body="appLogoUrl" type="string">
 URL to your application's logo image. Used in wallet UI. Defaults to empty string if not provided.
 </ParamField>

 <ParamField body="appChainIds" type="number[]">
 Array of chain IDs that your application supports. Defaults to empty array if not provided.
 </ParamField>

 <ParamField body="preference" type="Preference">
 Optional preferences for SDK behavior.

 <Expandable title="Preference properties">
 <ParamField body="walletUrl" type="string">
 Custom wallet URL override. Only use when overriding the default wallet URL with a custom environment.
 </ParamField>

 <ParamField body="attribution" type="Attribution">
 Attribution configuration for Smart Wallet transactions.

 <Expandable title="Attribution properties">
 <ParamField body="auto" type="boolean">
 When true, Smart Wallet will generate a 16 byte hex string from the app's origin.
 </ParamField>

 <ParamField body="dataSuffix" type="`0x${string}`">
 Custom 16 byte hex string appended to initCode and executeBatch calldata. Cannot be used with `auto: true`.
 </ParamField>
 </Expandable>
 </ParamField>

 <ParamField body="telemetry" type="boolean">
 Whether to enable functional telemetry. Defaults to `true`.
 </ParamField>
 </Expandable>
 </ParamField>

 <ParamField body="subAccounts" type="SubAccountOptions">
 Sub-account configuration options.

 <Expandable title="SubAccountOptions properties">
 <ParamField body="creation" type="'on-connect' | 'manual'">
 Controls when sub-accounts are created. Defaults to `'manual'`.

 * `'on-connect'`: Automatically creates a sub-account when connecting to the wallet (automatically injects `addSubAccount`capability to`wallet_connect`)
 * `'manual'`: Requires explicit `wallet_addSubAccount`call to create a sub-account
 </ParamField>

 <ParamField body="defaultAccount" type="'sub' | 'universal'">
 Controls which account is used by default when no account is specified. Defaults to`'universal'`.

 * `'sub'`: Sub-account is the default account (first in accounts array)
 * `'universal'`: Universal account is the default account (first in accounts array)
 </ParamField>

 <ParamField body="funding" type="'spend-permissions' | 'manual'">
 Controls how sub-accounts are funded. Defaults to `'spend-permissions'`.

 * `'spend-permissions'`: Routes through universal account if no spend permissions exist, handles insufficient balance errors automatically. Learn more in [Auto Spend Permissions](/base-account/improve-ux/sub-accounts#auto-spend-permissions)
 * `'manual'`: Direct execution from sub-account without automatic fallbacks
 </ParamField>

 <ParamField body="toOwnerAccount" type="ToOwnerAccountFn">
 Function that returns the owner account for signing sub-account transactions.

 <Expandable title="ToOwnerAccountFn signature">
#### Code
```typescript
type ToOwnerAccountFn = => Promise<{ account: OwnerAccount | null; }>
```Where`OwnerAccount`is a union type of:

 *`LocalAccount`(from viem) - A local account with private key
 *`WebAuthnAccount`(from viem) - A WebAuthn-based account for passkey authentication
 </Expandable>
 </ParamField>
 </Expandable>
 </ParamField>

 <ParamField body="paymasterUrls" type="Record<number, string>">
 Mapping of chain IDs to paymaster URLs for gasless transactions.
 </ParamField>
 </Expandable>
</ParamField>

## Returns

<ResponseField name="sdk" type="BaseAccountSDK">
 SDK instance with provider and sub-account management capabilities.

 <Expandable title="BaseAccountSDK properties">
 <ResponseField name="getProvider" type=" => ProviderInterface">
 Returns an EIP-1193 compliant Ethereum provider that can be used with web3 libraries like Viem, Wagmi, and Web3.js.
 </ResponseField>

 <ResponseField name="subAccount" type="SubAccountManager">
 Sub-account management methods.

 <Expandable title="SubAccountManager properties">
 <ResponseField name="create" type="(account: AddSubAccountAccount) => Promise<SubAccount>">
 Creates a new sub-account.
 </ResponseField>

 <ResponseField name="get" type=" => Promise<SubAccount | null>">
 Retrieves the current sub-account information.
 </ResponseField>

 <ResponseField name="addOwner" type="(params: AddOwnerParams) => Promise<string>">
 Adds an owner to the sub-account.
 </ResponseField>

 <ResponseField name="setToOwnerAccount" type="(fn: ToOwnerAccountFn) => void">
 Sets the function for determining the owner account. The function should return a Promise resolving to an object with an`account`property that is either a`LocalAccount`, `WebAuthnAccount`, or `null`.
 </ResponseField>
 </Expandable>
 </ResponseField>
 </Expandable>
</ResponseField>

<RequestExample>
#### Code
```typescript
 import { createBaseAccountSDK } from '@base-org/account';
 import { base } from 'viem/chains';

 const sdk = createBaseAccountSDK({
appName: 'My DApp',
appLogoUrl: 'https://mydapp.com/logo.png
appChainIds: [base.id],
 });

 const provider = sdk.getProvider;
```#### Code```typescript
 import { createBaseAccountSDK } from '@base-org/account';
 import { base, baseSepolia } from 'viem/chains';

 const sdk = createBaseAccountSDK({
appName: 'My Advanced DApp',
appLogoUrl: 'https://mydapp.com/logo.png
appChainIds: [base.id, baseSepolia.id],
preference: {
 attribution: {
auto: true
 },
 telemetry: true
},
subAccounts: {
 creation: 'on-connect', // Auto-create sub-account on connection
 defaultAccount: 'sub', // Use sub-account by default
 funding: 'spend-permissions', // Auto-handle funding
 toOwnerAccount: async => ({
account: cryptoAccount?.account || null
 })
},
paymasterUrls: {
 [base.id]: 'https://paymaster.base.org
 [baseSepolia.id]: 'https://paymaster.base-sepolia.org
}
 });
```#### Code```typescript
 import { createBaseAccountSDK } from '@base-org/account';

 const sdk = createBaseAccountSDK({
appName: 'Sub-Account App',
appChainIds: [8453],
subAccounts: {
 creation: 'manual', // Explicitly create sub-accounts when needed
 defaultAccount: 'universal', // Universal account is default
 funding: 'spend-permissions', // Auto-handle insufficient balance
 toOwnerAccount: async => {
// Return the owner account that will sign sub-account transactions
// mainAccount should be a LocalAccount or WebAuthnAccount from viem
return { account: mainAccount || null };
 }
}
 });

 // Manually create a sub-account when needed
 const subAccount = await sdk.subAccount.create({
type: 'create',
keys: [{
 type: 'p256',
 publicKey: '0x...'
}]
 });
```#### Code```typescript
 import { createBaseAccountSDK } from '@base-org/account';

 const sdk = createBaseAccountSDK({
appName: 'Auto Sub-Account App',
appChainIds: [8453],
subAccounts: {
 creation: 'on-connect', // Auto-create on wallet connection
 defaultAccount: 'sub', // Sub-account is default
 funding: 'spend-permissions', // Auto-handle insufficient balance
 toOwnerAccount: async => {
return { account: mainAccount || null };
 }
}
 });

 // Sub-account is automatically created on connection
 const provider = sdk.getProvider;
 await provider.request({ method: 'eth_requestAccounts' });

 // Sub-account is automatically available
 const subAccount = await sdk.subAccount.get;
```</RequestExample>

## Integration Examples

### With Viem
#### Code```typescript
import { createWalletClient, custom } from 'viem';
import { base } from 'viem/chains';
import { createBaseAccountSDK } from '@base-org/account';

const sdk = createBaseAccountSDK({
 appName: 'Viem Integration',
 appChainIds: [base.id]
});

const provider = sdk.getProvider;

const client = createWalletClient({
 chain: base,
 transport: custom(provider)
});
```### With Wagmi
#### Code```typescript
import { createConfig, custom } from 'wagmi';
import { base } from 'wagmi/chains';
import { createBaseAccountSDK } from '@base-org/account';

const sdk = createBaseAccountSDK({
 appName: 'Wagmi Integration',
 appChainIds: [base.id]
});

const provider = sdk.getProvider;

const config = createConfig({
 chains: [base],
 transports: {
[base.id]: custom(provider),
 },
});
```## Configuration Options

### Sub-Account Configuration

Configure sub-account behavior with three independent options:
#### Code```typescript
const sdk = createBaseAccountSDK({
 appName: 'My App',
 appChainIds: [8453],
 subAccounts: {
creation: 'on-connect' | 'manual', // When to create
defaultAccount: 'sub' | 'universal', // Which is default
funding: 'spend-permissions' | 'manual', // How to fund transactions
toOwnerAccount: async => ({ account }) // Owner for signing
 }
});
```**Common Configurations:**
#### Code```typescript
// Most seamless UX: Auto-create, use sub-account by default, auto-fund
subAccounts: {
 creation: 'on-connect',
 defaultAccount: 'sub',
 funding: 'spend-permissions'
}

// Manual control: Create when needed, universal default, auto-fund
subAccounts: {
 creation: 'manual',
 defaultAccount: 'universal',
 funding: 'spend-permissions'
}

// Full manual: Complete developer control
subAccounts: {
 creation: 'manual',
 defaultAccount: 'universal',
 funding: 'manual'
}
```### Attribution

Configure transaction attribution for analytics and tracking:
#### Code```typescript
// Auto-generate attribution from app origin
const sdk = createBaseAccountSDK({
 appName: 'My App',
 preference: {
attribution: { auto: true }
 }
});

// Custom attribution data
const sdk = createBaseAccountSDK({
 appName: 'My App',
 preference: {
attribution: { dataSuffix: '0x1234567890123456789012345678901234567890' }
 }
});
```### Paymaster Integration

Enable gasless transactions with paymaster URLs:
#### Code```typescript
const sdk = createBaseAccountSDK({
 appName: 'Gasless App',
 appChainIds: [8453, 84532],
 paymasterUrls: {
8453: 'https://paymaster.base.org/api/v1/sponsor
84532: 'https://paymaster.base-sepolia.org/api/v1/sponsor
 }
});
```## Error Handling

The SDK initialization is synchronous and will validate preferences during creation:
#### Code```typescript
try {
 const sdk = createBaseAccountSDK({
appName: 'My App',
appChainIds: [8453],
subAccounts: {
 toOwnerAccount: invalidFunction // Will throw validation error
}
 });
} catch (error) {
 console.error('SDK initialization failed:', error);
}
```## TypeScript Support

The SDK is fully typed for TypeScript development:
#### Code```typescript
import type {
 CreateProviderOptions,
 BaseAccountSDK,
 ProviderInterface,
 ToOwnerAccountFn
} from '@base-org/account';
import { LocalAccount } from 'viem';

const toOwnerAccount: ToOwnerAccountFn = async => {
 // Your logic to get the owner account
 const ownerAccount: LocalAccount | null = getOwnerAccount;
 return { account: ownerAccount };
};

const options: CreateProviderOptions = {
 appName: 'Typed App',
 appChainIds: [8453],
 subAccounts: {
toOwnerAccount
 }
};

const sdk: BaseAccountSDK = createBaseAccountSDK(options);
const provider: ProviderInterface = sdk.getProvider;
```> Warning:
The SDK automatically manages Cross-Origin-Opener-Policy validation and telemetry initialization. Make sure your application's headers allow popup windows if using the default wallet interface.

<Info>
 The`createBaseAccountSDK` function is the primary entry point for Base Account integration. It provides both a standard EIP-1193 provider and advanced features like sub-account management and gasless transactions.
</Info>

<BaseBanner
 id="privacy-policy"
 dismissable={false}
 content={({ onDismiss }) => (
 <div className="flex items-center">
 <div className="mr-2">
 We're updating the Base Privacy Policy, effective July 25, 2025, to reflect an expansion of Base services. Please review the updated policy here:{" "}
 <a
 href="https://docs.base.org/privacy-policy-2025
 target="_blank"
 className="whitespace-nowrap"
 >
 Base Privacy Policy
 </a>. By continuing to use Base services, you confirm that you have read and understand the updated policy.
 </div>
 <Button onClick={onDismiss}>I Acknowledge</Button>
 </div>
)}
/>


## Base Pay
# pay

> Send USDC payments on the Base network

export const Button = ({children, disabled, variant = "primary", size = "medium", iconName, roundedFull = false, className = '', fullWidth = false, onClick = undefined}) => {
 const variantStyles = {
 primary: 'bg-blue text-black border border-blue hover:bg-blue-80 active:bg-[#06318E] dark:text-white',
 secondary: 'bg-white border border-white text-palette-foreground hover:bg-zinc-15 active:bg-zinc-30',
 outlined: 'bg-transparent text-white border border-white hover:bg-white hover:text-black active:bg-[#E3E7E9]'
 };
 const sizeStyles = {
 medium: 'text-md px-4 py-2 gap-3',
 large: 'text-lg px-6 py-4 gap-5'
 };
 const sizeIconRatio = {
 medium: '0.75rem',
 large: '1rem'
 };
 const classes = ['text-md px-4 py-2 whitespace-nowrap', 'flex items-center justify-center', 'disabled:opacity-40 disabled:pointer-events-none', 'transition-all', variantStyles[variant], sizeStyles[size], roundedFull ? 'rounded-full' : 'rounded-lg', fullWidth ? 'w-full' : 'w-auto', className];
 const buttonClasses = classes.filter(Boolean).join(' ');
 const iconSize = sizeIconRatio[size];
 return <button type="button" disabled={disabled} className={buttonClasses} onClick={onClick}>
 <span>{children}</span>
 {iconName && <Icon name={iconName} width={iconSize} height={iconSize} color="currentColor" />}
 </button>;
};

export const BaseBanner = ({content = null, id, dismissable = true}) => {
 const LOCAL_STORAGE_KEY_PREFIX = 'cb-docs-banner';
 const [isVisible, setIsVisible] = useState(false);
 const onDismiss = => {
 localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}-${id}`, 'false');
 setIsVisible(false);
 };
 useEffect( => {
 const storedValue = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}-${id}`);
 setIsVisible(storedValue !== 'false');
 }, []);
 if (!isVisible) {
 return null;
 }
 return <div className="fixed bottom-0 left-0 right-0 bg-white py-8 px-4 lg:px-12 z-50 text-black dark:bg-black dark:text-white border-t dark:border-gray-95">
 <div className="flex items-center max-w-8xl mx-auto">
 {typeof content === 'function' ? content({
 onDismiss
 }) : content}
 {dismissable && <button onClick={onDismiss} className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" aria-label="Dismiss banner">
 ✕
 </button>}
 </div>
 </div>;
};

Defined in the [Base Account SDK](https://github.com/base/account-sdk)

<Info>
 The `pay`function is the core method of Base Pay that lets your users send USDC (digital dollars) on the Base network. No crypto knowledge required - we handle all the complexity. **No fees for merchants or users.**

 **Try it out:** Test the`pay`function interactively in our [Base Pay SDK Playground](https://base.github.io/account-sdk/pay-playground)
</Info>

## Parameters

<ParamField body="amount" type="string" required>
 Amount of USDC to send (e.g., "10.50" or "0.01").
</ParamField>

<ParamField body="to" type="string" required>
 Ethereum address to send USDC to (must start with 0x).

 **Pattern:**`^0x[0-9a-fA-F]{40}$`</ParamField>

<ParamField body="testnet" type="boolean">
 Set to true to use Base Sepolia testnet instead of mainnet. Default: false
</ParamField>

<ParamField body="payerInfo" type="object">
 Optional payer information configuration for data callbacks.

 <Expandable title="PayerInfo properties">
 <ParamField body="requests" type="array" required>
 Array of information requests from the payer.

 <Expandable title="InfoRequest properties">
 <ParamField body="type" type="string" required>
 The type of information being requested.

 **Possible values:**`'email' | 'physicalAddress' | 'phoneNumber' | 'name' | 'onchainAddress'`</ParamField>

 <ParamField body="optional" type="boolean">
 Whether this information is optional. Default: false
 </ParamField>
 </Expandable>
 </ParamField>

 <ParamField body="callbackURL" type="string">
 Optional callback URL for server-side validation.
 </ParamField>
 </Expandable>
</ParamField>

## Returns

<ResponseField name="result" type="PayResult">
 Payment result on success. The function throws an error on failure.

 <Expandable title="Payment Success properties">
 <ResponseField name="id" type="string">
 Transaction hash - use this to check payment status.
 </ResponseField>

 <ResponseField name="amount" type="string">
 Amount that was sent.
 </ResponseField>

 <ResponseField name="to" type="string">
 Address that received the payment.
 </ResponseField>

 <ResponseField name="payerInfoResponses" type="object">
 Optional responses from information requests.
 </ResponseField>
 </Expandable>
</ResponseField>

## Errors

The`pay`function throws an error when the payment fails. The error object contains a message explaining what went wrong.

<RequestExample>
#### Code```typescript
 import { pay } from '@base-org/account';

 try {
const payment = await pay({
 amount: "10.50",
 to: "0x1234567890123456789012345678901234567890",
 testnet: false
});
console.log(`Payment sent! Transaction ID: ${payment.id}`);
 } catch (error) {
console.error(`Payment failed: ${error.message}`);
 }
```#### Code```typescript
 try {
const payment = await pay({
 amount: "25.00",
 to: "0x1234567890123456789012345678901234567890",
 payerInfo: {
requests: [
 { type: 'email', optional: false },
 { type: 'phoneNumber', optional: true },
 { type: 'physicalAddress', optional: true }
],
callbackURL: "https://your-api.com/validate
 }
});

console.log(`Payment sent! Transaction ID: ${payment.id}`);

// Access collected user information
if (payment.payerInfoResponses) {
 console.log('Email:', payment.payerInfoResponses.email);

 if (payment.payerInfoResponses.phoneNumber) {
console.log('Phone:', payment.payerInfoResponses.phoneNumber.number);
console.log('Country:', payment.payerInfoResponses.phoneNumber.country);
 }

 if (payment.payerInfoResponses.physicalAddress) {
const address = payment.payerInfoResponses.physicalAddress;
console.log('Address:', address.address1);
console.log('City:', address.city);
console.log('State:', address.state);
console.log('Postal Code:', address.postalCode);
console.log('Recipient Name:', `${address.name.firstName} ${address.name.familyName}`);
 }
}
 } catch (error) {
console.error(`Payment failed: ${error.message}`);
 }
```</RequestExample>

<ResponseExample>
#### Code```typescript
 {
id: "0xabcd1234...",
amount: "10.50",
to: "0x1234567890123456789012345678901234567890"
 }
```#### Code```typescript
 {
id: "0xabcd1234...",
amount: "25.00",
to: "0x1234567890123456789012345678901234567890",
payerInfoResponses: {
 email: "user@example.com",
 phoneNumber: {
number: "+1234567890",
country: "US"
 },
 physicalAddress: {
address1: "123 Main St",
city: "San Francisco",
state: "CA",
postalCode: "94105",
country: "US",
name: {
 firstName: "John",
 familyName: "Doe"
}
 }
}
 }
```#### Code```typescript
 {
"code": 4001,
"message": "Request rejected",
"stack": "Error: Request rejected\n at getEthProviderError..."
 }
```</ResponseExample>

## Error Handling

The`pay`function throws errors instead of returning a result. Always wrap calls to`pay`in a try-catch block to handle errors gracefully:
#### Code```typescript
try {
 const payment = await pay({
amount: "10.00",
to: "0xRecipient"
 });
 // Payment succeeded, use payment.id for tracking
 console.log(`Payment sent! Transaction ID: ${payment.id}`);
} catch (error) {
 // Payment failed
 console.error(`Payment failed: ${error.message}`);
}
````

<BaseBanner
id="privacy-policy"
dismissable={false}
content={({ onDismiss }) => (

 <div className="flex items-center">
 <div className="mr-2">
 We're updating the Base Privacy Policy, effective July 25, 2025, to reflect an expansion of Base services. Please review the updated policy here:{" "}
 <a
 href="https://docs.base.org/privacy-policy-2025
 target="_blank"
 className="whitespace-nowrap"
 >
 Base Privacy Policy
 </a>. By continuing to use Base services, you confirm that you have read and understand the updated policy.
 </div>
 <Button onClick={onDismiss}>I Acknowledge</Button>
 </div>
)}
/>

# getPaymentStatus

> Check the status of a payment transaction

export const Button = ({children, disabled, variant = "primary", size = "medium", iconName, roundedFull = false, className = '', fullWidth = false, onClick = undefined}) => {
const variantStyles = {
primary: 'bg-blue text-black border border-blue hover:bg-blue-80 active:bg-[#06318E] dark:text-white',
secondary: 'bg-white border border-white text-palette-foreground hover:bg-zinc-15 active:bg-zinc-30',
outlined: 'bg-transparent text-white border border-white hover:bg-white hover:text-black active:bg-[#E3E7E9]'
};
const sizeStyles = {
medium: 'text-md px-4 py-2 gap-3',
large: 'text-lg px-6 py-4 gap-5'
};
const sizeIconRatio = {
medium: '0.75rem',
large: '1rem'
};
const classes = ['text-md px-4 py-2 whitespace-nowrap', 'flex items-center justify-center', 'disabled:opacity-40 disabled:pointer-events-none', 'transition-all', variantStyles[variant], sizeStyles[size], roundedFull ? 'rounded-full' : 'rounded-lg', fullWidth ? 'w-full' : 'w-auto', className];
const buttonClasses = classes.filter(Boolean).join(' ');
const iconSize = sizeIconRatio[size];
return <button type="button" disabled={disabled} className={buttonClasses} onClick={onClick}>
<span>{children}</span>
{iconName && <Icon name={iconName} width={iconSize} height={iconSize} color="currentColor" />}
</button>;
};

export const BaseBanner = ({content = null, id, dismissable = true}) => {
const LOCAL_STORAGE_KEY_PREFIX = 'cb-docs-banner';
const [isVisible, setIsVisible] = useState(false);
const onDismiss = => {
localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}-${id}`, 'false');
setIsVisible(false);
};
useEffect( => {
const storedValue = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}-${id}`);
setIsVisible(storedValue !== 'false');
}, []);
if (!isVisible) {
return null;
}
return <div className="fixed bottom-0 left-0 right-0 bg-white py-8 px-4 lg:px-12 z-50 text-black dark:bg-black dark:text-white border-t dark:border-gray-95">

 <div className="flex items-center max-w-8xl mx-auto">
 {typeof content === 'function' ? content({
 onDismiss
 }) : content}
 {dismissable && <button onClick={onDismiss} className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" aria-label="Dismiss banner">
 ✕
 </button>}
 </div>
 </div>;
};

Defined in the [Base Account SDK](https://github.com/base/account-sdk)

<Info>
 The `getPaymentStatus`function allows you to check the status of a payment transaction after it has been submitted. Use this to track whether a payment has been completed, is still pending, or has failed.

**Try it out:** Test the`getPaymentStatus`function interactively in our [Base Pay SDK Playground](https://base.github.io/account-sdk/pay-playground)
</Info>

## Parameters

<ParamField body="id" type="string" required>
 Transaction hash from the pay result that you want to check the status of.

**Pattern:**`^0x[0-9a-fA-F]{64}$`</ParamField>

<ParamField body="testnet" type="boolean">
 Must match the testnet setting used in the original pay call. Default: false
</ParamField>

## Returns

<ResponseField name="result" type="PaymentStatus">
 Payment status information including current state and details.

 <Expandable title="PaymentStatus properties">
 <ResponseField name="status" type="string">
 Current status of the payment.

**Possible values:**

\*`"completed"`: Payment successfully processed and confirmed

- `"pending"`: Payment still being processed by the network
- `"failed"`: Payment failed to process (funds not transferred)
- `"not_found"`: Transaction ID not found or invalid
  </ResponseField>

 <ResponseField name="id" type="string">
 Original transaction hash that was queried.
 </ResponseField>

 <ResponseField name="message" type="string">
 Human-readable status message explaining the current state.
 </ResponseField>

 <ResponseField name="sender" type="string">
 Sender address (present for pending, completed, and failed statuses).
 </ResponseField>

 <ResponseField name="amount" type="string">
 Amount that was sent (present for completed transactions).
 </ResponseField>

 <ResponseField name="recipient" type="string">
 Address that received the payment (present for completed transactions).
 </ResponseField>

 <ResponseField name="error" type="string">
 Error details (present for failed status).
 </ResponseField>
 </Expandable>
</ResponseField>

<RequestExample>
#### Code
```typescript
 import { getPaymentStatus } from '@base-org/account';

const status = await getPaymentStatus({
id: "0xabcd1234...",
testnet: false
});

console.log("Payment status:", status.status);
`#### Code`typescript
import { pay, getPaymentStatus } from '@base-org/account';

try {
// Send payment
const payment = await pay({
amount: "10.50",
to: "0x1234567890123456789012345678901234567890"
});
} catch (error) {
console.error(`Payment failed: ${error.message}`);
}

try {
// Check status
const status = await getPaymentStatus({
id: payment.id,
testnet: false
});

console.log("Status:", status.status);
catch (error) {
console.error(`Get status Failed: ${error.message}`);
}

````</RequestExample>

<ResponseExample>
#### Code```typescript
 {
status: "completed",
id: "0xabcd1234...",
message: "Payment completed successfully",
sender: "0x742d35Cc4Bf53E0e6C42E5d9F0A8D2F6D8A8B7C9",
amount: "10.50",
recipient: "0x1234567890123456789012345678901234567890"
 }
```#### Code```typescript
 {
status: "pending",
id: "0xabcd1234...",
message: "Payment is being processed",
sender: "0x742d35Cc4Bf53E0e6C42E5d9F0A8D2F6D8A8B7C9"
 }
```#### Code```typescript
 {
status: "failed",
id: "0xabcd1234...",
message: "Payment failed due to insufficient balance",
sender: "0x742d35Cc4Bf53E0e6C42E5d9F0A8D2F6D8A8B7C9",
error: "Insufficient balance"
 }
```#### Code```typescript
 {
status: "not_found",
id: "0xabcd1234...",
message: "Transaction not found"
 }
```</ResponseExample>

## Error Handling

The`getPaymentStatus`function can throw errors for:

* Invalid transaction ID format
* Network connection issues
* Transaction not found

Always wrap calls to`getPaymentStatus`in a try-catch block to handle these errors gracefully.

<BaseBanner
 id="privacy-policy"
 dismissable={false}
 content={({ onDismiss }) => (
 <div className="flex items-center">
 <div className="mr-2">
 We're updating the Base Privacy Policy, effective July 25, 2025, to reflect an expansion of Base services. Please review the updated policy here:{" "}
 <a
 href="https://docs.base.org/privacy-policy-2025
 target="_blank"
 className="whitespace-nowrap"
 >
 Base Privacy Policy
 </a>. By continuing to use Base services, you confirm that you have read and understand the updated policy.
 </div>
 <Button onClick={onDismiss}>I Acknowledge</Button>
 </div>
)}
/>


# getProvider

> Get an Ethereum provider instance from the Base Account SDK

The`getProvider`method returns an Ethereum provider instance that complies with [EIP-1193](https://eips.ethereum.org/EIPS/eip-1193) standards. This provider can be used with popular web3 libraries like Viem, Wagmi, and Web3.js.

## Usage
#### Code```tsx
import { createBaseAccountSDK, base } from '@base-org/account';

const sdk = createBaseAccountSDK({
 appName: 'My App Name',
 appLogoUrl: 'https://example.com/logo.png
 appChainIds: [base.constants.CHAIN_IDS.base],
});

const provider = sdk.getProvider;
````

## Returns

An EIP-1193 compliant Ethereum provider that supports:

- Standard RPC methods (`eth_requestAccounts`, `eth_sendTransaction`, `wallet_sendCalls` etc.)
- Custom Wallet methods (`coinbase_fetchPermissions`)
- Event subscription (`accountsChanged`, `chainChanged`, etc.)

For a full list of supported methods, see the [Provider Section](/base-account/reference/core/provider-rpc-methods/request-overview)

## Integration Examples

### With Viem

#### Code

````tsx
import { createWalletClient, custom } from 'viem';
import { base } from 'viem/chains';

const provider = sdk.getProvider;

const client = createWalletClient({
 chain: base,
 transport: custom(provider)
});

// Use the client
const [account] = await client.getAddresses;
const hash = await client.sendTransaction({
 account,
 to: '0x...',
 value: parseEther('0.1')
});
```### With Wagmi
#### Code```tsx
import { createConfig, custom } from 'wagmi';
import { base } from 'wagmi/chains';

const provider = sdk.getProvider;

const config = createConfig({
 chains: [base],
 transports: {
[base.id]: custom(provider),
 },
});
```### Direct Provider Usage
#### Code```tsx
// Request accounts
const accounts = await provider.request({
 method: 'eth_requestAccounts'
});

// Send transaction
const txHash = await provider.request({
 method: 'eth_sendTransaction',
 params: [{
from: accounts[0],
to: '0x...',
value: '0x38d7ea4c68000', // 0.001 ETH in wei
 }]
});

// Send batch transactions
const result = await provider.request({
 method: 'wallet_sendCalls',
 params: [{
version: '2.0.0',
from: accounts[0],
chainId: '0x2105', // Base mainnet
atomicRequired: true,
calls: [
 {
to: '0x...',
value: '0x0',
data: '0x...'
 }
]
 }]
});
```## Event Handling

The provider emits standard EIP-1193 events:
#### Code```tsx
// Listen for account changes
provider.on('accountsChanged', (accounts) => {
 console.log('Accounts changed:', accounts);
});

// Listen for chain changes
provider.on('chainChanged', (chainId) => {
 console.log('Chain changed:', chainId);
});

// Listen for connection events
provider.on('connect', (connectInfo) => {
 console.log('Connected:', connectInfo);
});

// Listen for disconnection
provider.on('disconnect', (error) => {
 console.log('Disconnected:', error);
});
```## Error Handling

Handle provider errors gracefully:
#### Code```tsx
try {
 const accounts = await provider.request({
method: 'eth_requestAccounts'
 });
} catch (error) {
 if (error.code === 4001) {
console.log('User rejected the request');
 } else if (error.code === -32602) {
console.log('Invalid parameters');
 } else {
console.error('Unexpected error:', error);
 }
}
```## Provider Configuration

The provider behavior is configured through the SDK initialization:
#### Code```tsx
const sdk = createBaseAccountSDK({
 appName: 'My App Name',
 appLogoUrl: 'https://example.com/logo.png
 appChainIds: [base.constants.CHAIN_IDS.base],
 // Additional configuration affects provider behavior
 subAccounts: {
toOwnerAccount: async => ({ account: cryptoAccount?.account })
 }
});
```## TypeScript Support

The provider is fully typed when using TypeScript:
#### Code```tsx
import type { EIP1193Provider } from '@base-org/account';

const provider: EIP1193Provider = sdk.getProvider;

// TypeScript will provide full intellisense for supported methods
```The`getProvider` method is the primary way to interact with Base Account from your application, providing a standard interface that works seamlessly with the web3 ecosystem.


# generateKeyPair

> Generate a new P256 key pair for use with Base Account

export const Button = ({children, disabled, variant = "primary", size = "medium", iconName, roundedFull = false, className = '', fullWidth = false, onClick = undefined}) => {
 const variantStyles = {
 primary: 'bg-blue text-black border border-blue hover:bg-blue-80 active:bg-[#06318E] dark:text-white',
 secondary: 'bg-white border border-white text-palette-foreground hover:bg-zinc-15 active:bg-zinc-30',
 outlined: 'bg-transparent text-white border border-white hover:bg-white hover:text-black active:bg-[#E3E7E9]'
 };
 const sizeStyles = {
 medium: 'text-md px-4 py-2 gap-3',
 large: 'text-lg px-6 py-4 gap-5'
 };
 const sizeIconRatio = {
 medium: '0.75rem',
 large: '1rem'
 };
 const classes = ['text-md px-4 py-2 whitespace-nowrap', 'flex items-center justify-center', 'disabled:opacity-40 disabled:pointer-events-none', 'transition-all', variantStyles[variant], sizeStyles[size], roundedFull ? 'rounded-full' : 'rounded-lg', fullWidth ? 'w-full' : 'w-auto', className];
 const buttonClasses = classes.filter(Boolean).join(' ');
 const iconSize = sizeIconRatio[size];
 return <button type="button" disabled={disabled} className={buttonClasses} onClick={onClick}>
 <span>{children}</span>
 {iconName && <Icon name={iconName} width={iconSize} height={iconSize} color="currentColor" />}
 </button>;
};

export const BaseBanner = ({content = null, id, dismissable = true}) => {
 const LOCAL_STORAGE_KEY_PREFIX = 'cb-docs-banner';
 const [isVisible, setIsVisible] = useState(false);
 const onDismiss = => {
 localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}-${id}`, 'false');
 setIsVisible(false);
 };
 useEffect( => {
 const storedValue = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}-${id}`);
 setIsVisible(storedValue !== 'false');
 }, []);
 if (!isVisible) {
 return null;
 }
 return <div className="fixed bottom-0 left-0 right-0 bg-white py-8 px-4 lg:px-12 z-50 text-black dark:bg-black dark:text-white border-t dark:border-gray-95">
 <div className="flex items-center max-w-8xl mx-auto">
 {typeof content === 'function' ? content({
 onDismiss
 }) : content}
 {dismissable && <button onClick={onDismiss} className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" aria-label="Dismiss banner">
 ✕
 </button>}
 </div>
 </div>;
};

Defined in the [Base Account SDK](https://github.com/base/account-sdk)

<Info>
 Generates a new P256 key pair for use with Base Account. This is essential for advanced integrations and Sub Account management.
</Info>

## Parameters

This function takes no parameters.

## Returns

<ResponseField name="result" type="P256KeyPair">
 A P256 key pair object containing the public and private keys.

 <Expandable title="P256KeyPair properties">
 <ResponseField name="publicKey" type="string">
 The public key for the generated pair in hexadecimal format.
 </ResponseField>

 <ResponseField name="privateKey" type="string">
 The private key for the generated pair. Handle with extreme care.
 </ResponseField>
 </Expandable>
</ResponseField>

<RequestExample>
#### Code
```typescript
 import { generateKeyPair } from '@base-org/account';

 const keyPair = await generateKeyPair;
 console.log('Public key:', keyPair.publicKey);
```#### Code```typescript
 try {
const keyPair = await generateKeyPair;
return keyPair;
 } catch (error) {
console.error('Failed to generate key pair:', error);
throw error;
 }
```</RequestExample>

<ResponseExample>
#### Code```typescript
 {
publicKey: "0x04a1b2c3d4e5f6...",
privateKey: "0x1a2b3c4d5e6f7a..."
 }
```</ResponseExample>

## Error Handling

| Code | Message | Description |
| ---- | ---------------------------- | ------------------------------------------------------------ |
| 4100 | Key generation not supported | Browser does not support cryptographic key generation |
| 4200 | Insufficient entropy | System lacks sufficient randomness for secure key generation |
| 4300 | Cryptographic system failure | Hardware or software cryptographic failure |


> Warning:
**Private Key Security**

 Never expose private keys in client-side code or transmit them over insecure channels. Store them securely using appropriate key management systems.

## Integration with Sub Accounts
#### Code```typescript
import { generateKeyPair, createBaseAccountSDK } from '@base-org/account';

async function createSubAccountWithNewKeys {
 const sdk = createBaseAccountSDK({
appName: 'My App',
appLogoUrl: 'https://example.com/logo.png
appChainIds: [8453], // Base mainnet
 });

 // Generate new key pair for sub account
 const keyPair = await generateKeyPair;

 // Create sub account with the generated keys
 const subAccount = await sdk.subAccount.create({
type: 'create',
keys: [{
 type: 'webauthn-p256',
 publicKey: keyPair.publicKey,
}],
 });

 return { subAccount, keyPair };
}
```## Error Handling

The`generateKeyPair`function can throw errors for:

* Cryptographic system failures
* Insufficient entropy
* Browser compatibility issues

Always wrap calls to`generateKeyPair`in a try-catch block:
#### Code```typescript
try {
 const keyPair = await generateKeyPair;
 // Handle successful generation
} catch (error) {
 if (error.message.includes('not supported')) {
console.error('Browser does not support key generation');
 } else {
console.error('Key generation failed:', error);
 }
}
````

## Security Considerations

> Warning:
> **Private Key Security**

Never expose private keys in client-side code or transmit them over insecure channels. Store them securely using appropriate key management systems.

- Store private keys using secure storage mechanisms
- Never log private keys to console in production
- Consider using hardware security modules for production applications
- Implement proper key rotation policies

<BaseBanner
id="privacy-policy"
dismissable={false}
content={({ onDismiss }) => (

 <div className="flex items-center">
 <div className="mr-2">
 We're updating the Base Privacy Policy, effective July 25, 2025, to reflect an expansion of Base services. Please review the updated policy here:{" "}
 <a
 href="https://docs.base.org/privacy-policy-2025
 target="_blank"
 className="whitespace-nowrap"
 >
 Base Privacy Policy
 </a>. By continuing to use Base services, you confirm that you have read and understand the updated policy.
 </div>
 <Button onClick={onDismiss}>I Acknowledge</Button>
 </div>
)}
/>

# getKeypair

> Retrieve an existing P256 key pair from storage

export const Button = ({children, disabled, variant = "primary", size = "medium", iconName, roundedFull = false, className = '', fullWidth = false, onClick = undefined}) => {
const variantStyles = {
primary: 'bg-blue text-black border border-blue hover:bg-blue-80 active:bg-[#06318E] dark:text-white',
secondary: 'bg-white border border-white text-palette-foreground hover:bg-zinc-15 active:bg-zinc-30',
outlined: 'bg-transparent text-white border border-white hover:bg-white hover:text-black active:bg-[#E3E7E9]'
};
const sizeStyles = {
medium: 'text-md px-4 py-2 gap-3',
large: 'text-lg px-6 py-4 gap-5'
};
const sizeIconRatio = {
medium: '0.75rem',
large: '1rem'
};
const classes = ['text-md px-4 py-2 whitespace-nowrap', 'flex items-center justify-center', 'disabled:opacity-40 disabled:pointer-events-none', 'transition-all', variantStyles[variant], sizeStyles[size], roundedFull ? 'rounded-full' : 'rounded-lg', fullWidth ? 'w-full' : 'w-auto', className];
const buttonClasses = classes.filter(Boolean).join(' ');
const iconSize = sizeIconRatio[size];
return <button type="button" disabled={disabled} className={buttonClasses} onClick={onClick}>
<span>{children}</span>
{iconName && <Icon name={iconName} width={iconSize} height={iconSize} color="currentColor" />}
</button>;
};

export const BaseBanner = ({content = null, id, dismissable = true}) => {
const LOCAL_STORAGE_KEY_PREFIX = 'cb-docs-banner';
const [isVisible, setIsVisible] = useState(false);
const onDismiss = => {
localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}-${id}`, 'false');
setIsVisible(false);
};
useEffect( => {
const storedValue = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}-${id}`);
setIsVisible(storedValue !== 'false');
}, []);
if (!isVisible) {
return null;
}
return <div className="fixed bottom-0 left-0 right-0 bg-white py-8 px-4 lg:px-12 z-50 text-black dark:bg-black dark:text-white border-t dark:border-gray-95">

 <div className="flex items-center max-w-8xl mx-auto">
 {typeof content === 'function' ? content({
 onDismiss
 }) : content}
 {dismissable && <button onClick={onDismiss} className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" aria-label="Dismiss banner">
 ✕
 </button>}
 </div>
 </div>;
};

Defined in the [Base Account SDK](https://github.com/base/account-sdk)

<Info>
 Retrieves an existing P256 key pair if one has been previously generated and stored. This is useful for checking if keys already exist before generating new ones.
</Info>

## Parameters

This function takes no parameters.

## Returns

<ResponseField name="result" type="P256KeyPair | null">
 The stored P256 key pair or `null`if no key pair exists.

 <Expandable title="P256KeyPair properties">
 <ResponseField name="publicKey" type="string">
 The public key for the stored pair in hexadecimal format.
 </ResponseField>

 <ResponseField name="privateKey" type="string">
 The private key for the stored pair. Handle with extreme care.
 </ResponseField>
 </Expandable>
</ResponseField>

<RequestExample>
#### Code```typescript
 import { getKeypair } from '@base-org/account';

const existingKeyPair = await getKeypair;
if (existingKeyPair) {
console.log('Found existing key pair');
} else {
console.log('No existing key pair found');
}
`#### Code`typescript
import { getKeypair, generateKeyPair } from '@base-org/account';

let keyPair = await getKeypair;
if (!keyPair) {
keyPair = await generateKeyPair;
}

````</RequestExample>

<ResponseExample>
#### Code```typescript
 {
publicKey: "0x04a1b2c3d4e5f6...",
privateKey: "0x1a2b3c4d5e6f7a..."
 }
```#### Code```typescript
 null
```</ResponseExample>


> Warning:
**Private Key Access**

 The retrieved private keys should be handled with the same security considerations as newly generated keys.

## Get or Create Pattern

A common pattern is to check for existing keys before generating new ones:
#### Code```typescript
import { getKeypair, generateKeyPair } from '@base-org/account';

async function getOrCreateKeyPair {
 // Try to get existing key pair first
 let keyPair = await getKeypair;

 if (!keyPair) {
// Generate new key pair if none exists
console.log('No existing key pair, generating new one...');
keyPair = await generateKeyPair;
 } else {
console.log('Using existing key pair');
 }

 return keyPair;
}
```## Storage Behavior

The`getKeypair`function retrieves keys from:

* Browser's secure storage (for web applications)
* Platform-specific secure storage (for native applications)
* Memory cache (for the current session)

<Info>
 Key pairs are stored securely and are only accessible within the same origin and application context.
</Info>

## Error Handling

The`getKeypair`function can throw errors for:

* Storage access failures
* Data corruption issues
* Browser compatibility problems

Always wrap calls to`getKeypair`in a try-catch block:
#### Code```typescript
try {
 const keyPair = await getKeypair;
 if (keyPair) {
// Use existing keys
 } else {
// No keys found, may need to generate new ones
 }
} catch (error) {
 console.error('Error accessing key storage:', error);
 // Handle storage access errors
}
```## Key Lifecycle Management
#### Code```typescript
class KeyManager {
 private keyPair: P256KeyPair | null = null;

 async initialize {
try {
 // Load existing keys
 this.keyPair = await getKeypair;

 if (this.keyPair) {
console.log('Loaded existing key pair');
 } else {
console.log('No stored keys found');
 }

 return !!this.keyPair;
} catch (error) {
 console.error('Failed to initialize key manager:', error);
 return false;
}
 }

 hasKeys: boolean {
return !!this.keyPair;
 }

 async ensureKeys: Promise<P256KeyPair> {
if (!this.keyPair) {
 console.log('Generating new key pair...');
 this.keyPair = await generateKeyPair;
}
return this.keyPair;
 }

 getPublicKey: string | null {
return this.keyPair?.publicKey || null;
 }
}
````

## Security Considerations

> Warning:
> **Private Key Access**

The retrieved private keys should be handled with the same security considerations as newly generated keys.

- Always verify key integrity before use
- Implement proper access controls
- Consider re-generating keys periodically for enhanced security

<BaseBanner
id="privacy-policy"
dismissable={false}
content={({ onDismiss }) => (

 <div className="flex items-center">
 <div className="mr-2">
 We're updating the Base Privacy Policy, effective July 25, 2025, to reflect an expansion of Base services. Please review the updated policy here:{" "}
 <a
 href="https://docs.base.org/privacy-policy-2025
 target="_blank"
 className="whitespace-nowrap"
 >
 Base Privacy Policy
 </a>. By continuing to use Base services, you confirm that you have read and understand the updated policy.
 </div>
 <Button onClick={onDismiss}>I Acknowledge</Button>
 </div>
)}
/>

# getCryptoKeyAccount

> Retrieve the current crypto key account associated with the user's session

export const Button = ({children, disabled, variant = "primary", size = "medium", iconName, roundedFull = false, className = '', fullWidth = false, onClick = undefined}) => {
const variantStyles = {
primary: 'bg-blue text-black border border-blue hover:bg-blue-80 active:bg-[#06318E] dark:text-white',
secondary: 'bg-white border border-white text-palette-foreground hover:bg-zinc-15 active:bg-zinc-30',
outlined: 'bg-transparent text-white border border-white hover:bg-white hover:text-black active:bg-[#E3E7E9]'
};
const sizeStyles = {
medium: 'text-md px-4 py-2 gap-3',
large: 'text-lg px-6 py-4 gap-5'
};
const sizeIconRatio = {
medium: '0.75rem',
large: '1rem'
};
const classes = ['text-md px-4 py-2 whitespace-nowrap', 'flex items-center justify-center', 'disabled:opacity-40 disabled:pointer-events-none', 'transition-all', variantStyles[variant], sizeStyles[size], roundedFull ? 'rounded-full' : 'rounded-lg', fullWidth ? 'w-full' : 'w-auto', className];
const buttonClasses = classes.filter(Boolean).join(' ');
const iconSize = sizeIconRatio[size];
return <button type="button" disabled={disabled} className={buttonClasses} onClick={onClick}>
<span>{children}</span>
{iconName && <Icon name={iconName} width={iconSize} height={iconSize} color="currentColor" />}
</button>;
};

export const BaseBanner = ({content = null, id, dismissable = true}) => {
const LOCAL_STORAGE_KEY_PREFIX = 'cb-docs-banner';
const [isVisible, setIsVisible] = useState(false);
const onDismiss = => {
localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}-${id}`, 'false');
setIsVisible(false);
};
useEffect( => {
const storedValue = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}-${id}`);
setIsVisible(storedValue !== 'false');
}, []);
if (!isVisible) {
return null;
}
return <div className="fixed bottom-0 left-0 right-0 bg-white py-8 px-4 lg:px-12 z-50 text-black dark:bg-black dark:text-white border-t dark:border-gray-95">

 <div className="flex items-center max-w-8xl mx-auto">
 {typeof content === 'function' ? content({
 onDismiss
 }) : content}
 {dismissable && <button onClick={onDismiss} className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" aria-label="Dismiss banner">
 ✕
 </button>}
 </div>
 </div>;
};

Defined in the [Base Account SDK](https://github.com/base/account-sdk)

## Parameters

This function takes no parameters.

## Returns

<ResponseField name="result" type="CryptoKeyAccountResult">
 An object containing the user's crypto key account information or null if none exists.

 <Expandable title="CryptoKeyAccountResult properties">
 <ResponseField name="account" type="WebAuthnAccount | LocalAccount | null">
 The user's crypto key account object, or null if none is available.

 <Expandable title="WebAuthnAccount properties">
 <ResponseField name="publicKey" type="string">
 Public key associated with the account.
 </ResponseField>

 <ResponseField name="type" type="string">
 Account type identifier. Value: "webauthn"
 </ResponseField>
 </Expandable>

 <Expandable title="LocalAccount properties">
 <ResponseField name="address" type="string">
 Ethereum address of the account (42-character hex string starting with 0x).
 </ResponseField>

 <ResponseField name="publicKey" type="string">
 Public key associated with the account.
 </ResponseField>

 <ResponseField name="type" type="string">
 Account type identifier. Value: "local"
 </ResponseField>
 </Expandable>
 </ResponseField>
 </Expandable>
</ResponseField>

<RequestExample>
#### Code
```typescript
 import { getCryptoKeyAccount } from '@base-org/account';

const cryptoAccount = await getCryptoKeyAccount;
if (cryptoAccount?.account) {
console.log('Account address:', cryptoAccount.account.address);
}
`#### Code`typescript
const cryptoAccount = await getCryptoKeyAccount;

if (!cryptoAccount?.account) {
console.log('No account found - user needs to sign in');
return null;
}

const { account } = cryptoAccount;
console.log('Account type:', account.type);

````</RequestExample>

<ResponseExample>
#### Code```typescript
 {
account: {
 address: "0xd46e8dd67c5d32be8058bb8eb970870f07244567",
 publicKey: "0x04a1b2c3d4e5f6...",
 type: "webauthn"
}
 }
```#### Code```typescript
 {
account: {
 address: "0x742d35Cc4Bf53E0e6C42E5d9F0A8D2F6D8A8B7C9",
 publicKey: "0x04b2c3d4e5f6a7...",
 type: "local"
}
 }
```#### Code```typescript
 {
account: null
 }
```</ResponseExample>

## Error Handling

| Code | Message | Description |
| ---- | -------------------------- | ----------------------------------------------- |
| 4001 | User denied account access | User rejected the account access request |
| 4100 | SDK not initialized | Base Account SDK not properly initialized |
| 4200 | Session expired | User session has expired, requires reconnection |
| 4300 | Account unavailable | Account temporarily unavailable |


> Warning:
Always check if the account exists before using it, as users may not be connected or may have disconnected.

## Account State Management
#### Code```typescript
import { getCryptoKeyAccount } from '@base-org/account';

class AccountManager {
 private currentAccount: WebAuthnAccount | LocalAccount | null = null;

 async initialize {
const cryptoAccount = await getCryptoKeyAccount;
this.currentAccount = cryptoAccount?.account || null;

return this.isConnected;
 }

 isConnected: boolean {
return !!this.currentAccount;
 }

 getAddress: string | null {
return this.currentAccount?.address || null;
 }

 getAccountType: 'webauthn' | 'local' | null {
return this.currentAccount?.type || null;
 }

 async refresh {
const cryptoAccount = await getCryptoKeyAccount;
const newAccount = cryptoAccount?.account;

// Check if account changed
if (newAccount?.address !== this.currentAccount?.address) {
 console.log('Account changed:', newAccount?.address);
 this.currentAccount = newAccount;
 return true;
}

return false;
 }
}
```## Integration with Provider
#### Code```typescript
import { getCryptoKeyAccount, createBaseAccountSDK } from '@base-org/account';

async function initializeApp {
 const sdk = createBaseAccountSDK({
appName: 'My App',
appLogoUrl: 'https://example.com/logo.png
appChainIds: [8453], // Base mainnet
 });

 // Check current account status
 const cryptoAccount = await getCryptoKeyAccount;

 if (cryptoAccount?.account) {
console.log('User is already connected:', cryptoAccount.account.address);

// Get provider for transactions
const provider = sdk.getProvider;

return {
 sdk,
 provider,
 account: cryptoAccount.account,
 isConnected: true
};
 } else {
console.log('User needs to connect');

return {
 sdk,
 provider: null,
 account: null,
 isConnected: false
};
 }
}
```## Account Verification
#### Code```typescript
async function verifyAccountAccess {
 const cryptoAccount = await getCryptoKeyAccount;

 if (!cryptoAccount?.account) {
throw new Error('No account available');
 }

 const { account } = cryptoAccount;

 // Verify account has required properties
 if (!account.address || !account.publicKey) {
throw new Error('Invalid account data');
 }

 // Verify address format
 if (!/^0x[a-fA-F0-9]{40}$/.test(account.address)) {
throw new Error('Invalid address format');
 }

 return account;
}
````

<BaseBanner
id="privacy-policy"
dismissable={false}
content={({ onDismiss }) => (

 <div className="flex items-center">
 <div className="mr-2">
 We're updating the Base Privacy Policy, effective July 25, 2025, to reflect an expansion of Base services. Please review the updated policy here:{" "}
 <a
 href="https://docs.base.org/privacy-policy-2025
 target="_blank"
 className="whitespace-nowrap"
 >
 Base Privacy Policy
 </a>. By continuing to use Base services, you confirm that you have read and understand the updated policy.
 </div>
 <Button onClick={onDismiss}>I Acknowledge</Button>
 </div>
)}
/>

## PROVIDER

Methods:

Overview:

# Overview

export const Button = ({children, disabled, variant = "primary", size = "medium", iconName, roundedFull = false, className = '', fullWidth = false, onClick = undefined}) => {
const variantStyles = {
primary: 'bg-blue text-black border border-blue hover:bg-blue-80 active:bg-[#06318E] dark:text-white',
secondary: 'bg-white border border-white text-palette-foreground hover:bg-zinc-15 active:bg-zinc-30',
outlined: 'bg-transparent text-white border border-white hover:bg-white hover:text-black active:bg-[#E3E7E9]'
};
const sizeStyles = {
medium: 'text-md px-4 py-2 gap-3',
large: 'text-lg px-6 py-4 gap-5'
};
const sizeIconRatio = {
medium: '0.75rem',
large: '1rem'
};
const classes = ['text-md px-4 py-2 whitespace-nowrap', 'flex items-center justify-center', 'disabled:opacity-40 disabled:pointer-events-none', 'transition-all', variantStyles[variant], sizeStyles[size], roundedFull ? 'rounded-full' : 'rounded-lg', fullWidth ? 'w-full' : 'w-auto', className];
const buttonClasses = classes.filter(Boolean).join(' ');
const iconSize = sizeIconRatio[size];
return <button type="button" disabled={disabled} className={buttonClasses} onClick={onClick}>
<span>{children}</span>
{iconName && <Icon name={iconName} width={iconSize} height={iconSize} color="currentColor" />}
</button>;
};

export const BaseBanner = ({content = null, id, dismissable = true}) => {
const LOCAL_STORAGE_KEY_PREFIX = 'cb-docs-banner';
const [isVisible, setIsVisible] = useState(false);
const onDismiss = => {
localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}-${id}`, 'false');
setIsVisible(false);
};
useEffect( => {
const storedValue = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}-${id}`);
setIsVisible(storedValue !== 'false');
}, []);
if (!isVisible) {
return null;
}
return <div className="fixed bottom-0 left-0 right-0 bg-white py-8 px-4 lg:px-12 z-50 text-black dark:bg-black dark:text-white border-t dark:border-gray-95">

 <div className="flex items-center max-w-8xl mx-auto">
 {typeof content === 'function' ? content({
 onDismiss
 }) : content}
 {dismissable && <button onClick={onDismiss} className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" aria-label="Dismiss banner">
 ✕
 </button>}
 </div>
 </div>;
};

The `request`method allows apps to make Ethereum RPC requests to the wallet.

## Specification

#### Code```ts

interface RequestArguments {
readonly method: string;
readonly params?: readonly unknown[] | object;
}

interface ProviderRpcError extends Error {
message: string;
code: number;
data?: unknown;
}

interface ProviderInterface {
/\*\*

- @param {RequestArguments} args request arguments.
- @returns A promise that resolves with the result.
- @throws {ProviderRpcError} in case of error.
  \*/
  request(args: RequestArguments): Promise<unknown>;
  disconnect: Promise<void>;
  emit<K extends keyof ProviderEventMap>(event: K, ...args: [ProviderEventMap[K]]): boolean;
  on<K extends keyof ProviderEventMap>(event: K, listener: (\_: ProviderEventMap[K]) => void): this;
  }

type CreateProviderOptions = Partial<AppMetadata> & {
preference?: Preference;
subAccounts?: SubAccountOptions;
paymasterUrls?: Record<number, string>;
};

interface BaseAccountSDK {
getProvider: ProviderInterface;
subAccount: {
create(account: AddSubAccountAccount): Promise<SubAccount>;
get: Promise<SubAccount | null>;
addOwner(params: { address?: `0x${string}`; publicKey?: `0x${string}`; chainId: number }): Promise<string>;
setToOwnerAccount(toSubAccountOwner: ToOwnerAccountFn): void;
};
}

````### Example

<CodeGroup>
#### Code```ts
 import {provider} from "./setup";

 const addresses = await provider.request({method: 'eth_requestAccounts'});
 const txHash = await provider.request({
 method: 'eth_sendTransaction',
 params: [{from: addresses[0], to: addresses[0], value: 1}]
}
 );
```#### Code```ts
 import { createBaseAccountSDK } from '@base-org/account'

 const baseSepoliaChainId = 84532;

 export const sdk = createBaseAccountSDK({
appName: 'My App Name',
appChainIds: [baseSepoliaChainId]
 });

 const provider = sdk.getProvider;
````

</CodeGroup>

## Request Handling

Requests are handled in one of three ways

1. Sent to the Wallet application (Wallet mobile app, extension, or popup window).
2. Handled locally by the SDK.
3. Passed onto default RPC provider for the given chain, if it exists.

### 1. Sent to the Wallet application

The following RPC requests are sent to the Wallet application:

- [`personal_sign`](/base-account/reference/core/provider-rpc-methods/personal_sign)
- [`eth_sendTransaction`](/base-account/reference/core/provider-rpc-methods/eth_sendTransaction)
- [`eth_sendRawTransaction`](/base-account/reference/core/provider-rpc-methods/eth_sendRawTransaction)
- [`eth_signTypedData_v4`](/base-account/reference/core/provider-rpc-methods/eth_signTypedData_v4)
- [`wallet_addEthereumChain`](/base-account/reference/core/provider-rpc-methods/wallet_addEthereumChain)
- [`wallet_watchAsset`](/base-account/reference/core/provider-rpc-methods/wallet_watchAsset)
- [`wallet_sendCalls`](/base-account/reference/core/provider-rpc-methods/wallet_sendCalls)
- [`wallet_getCallsStatus`](/base-account/reference/core/provider-rpc-methods/wallet_getCallsStatus)
- [`wallet_connect`](/base-account/reference/core/provider-rpc-methods/wallet_connect)
- [`wallet_getCapabilities`](/base-account/reference/core/provider-rpc-methods/wallet_getCapabilities)
- [`wallet_switchEthereumChain`](/base-account/reference/core/provider-rpc-methods/wallet_switchEthereumChain)
- [`wallet_addSubAccount`](/base-account/reference/core/provider-rpc-methods/wallet_addSubAccount)
- [`wallet_getSubAccounts`](/base-account/reference/core/provider-rpc-methods/wallet_getSubAccounts)
- [`coinbase_fetchPermissions`](/base-account/reference/core/provider-rpc-methods/coinbase_fetchPermissions)
- [`coinbase_fetchPermission`](/base-account/reference/core/provider-rpc-methods/coinbase_fetchPermission)

### 2. Handled Locally by the SDK

The following requests are handled locally by the SDK, with no external calls:

- [`eth_requestAccounts`](/base-account/reference/core/provider-rpc-methods/eth_requestAccounts)
- [`eth_accounts`](/base-account/reference/core/provider-rpc-methods/eth_accounts)
- [`eth_coinbase`](/base-account/reference/core/provider-rpc-methods/eth_coinbase)
- [`eth_chainId`](/base-account/reference/core/provider-rpc-methods/eth_chainId)
- [`web3_clientVersion`](/base-account/reference/core/provider-rpc-methods/web3_clientVersion)

### 3. Passed to RPC Provider

Standard Ethereum RPC methods are passed to the configured RPC provider for the current chain, including:

- [`eth_getBalance`](/base-account/reference/core/provider-rpc-methods/eth_getBalance)
- [`eth_blockNumber`](/base-account/reference/core/provider-rpc-methods/eth_blockNumber)
- [`eth_gasPrice`](/base-account/reference/core/provider-rpc-methods/eth_gasPrice)
- [`eth_estimateGas`](/base-account/reference/core/provider-rpc-methods/eth_estimateGas)
- [`eth_feeHistory`](/base-account/reference/core/provider-rpc-methods/eth_feeHistory)
- [`eth_getBlockByNumber`](/base-account/reference/core/provider-rpc-methods/eth_getBlockByNumber)
- [`eth_getBlockByHash`](/base-account/reference/core/provider-rpc-methods/eth_getBlockByHash)
- [`eth_getTransactionByHash`](/base-account/reference/core/provider-rpc-methods/eth_getTransactionByHash)
- [`eth_getTransactionReceipt`](/base-account/reference/core/provider-rpc-methods/eth_getTransactionReceipt)
- [`eth_getTransactionCount`](/base-account/reference/core/provider-rpc-methods/eth_getTransactionCount)
- [`eth_getTransactionByBlockHashAndIndex`](/base-account/reference/core/provider-rpc-methods/eth_getTransactionByBlockHashAndIndex)
- [`eth_getTransactionByBlockNumberAndIndex`](/base-account/reference/core/provider-rpc-methods/eth_getTransactionByBlockNumberAndIndex)
- [`eth_getBlockTransactionCountByHash`](/base-account/reference/core/provider-rpc-methods/eth_getBlockTransactionCountByHash)
- [`eth_getBlockTransactionCountByNumber`](/base-account/reference/core/provider-rpc-methods/eth_getBlockTransactionCountByNumber)
- [`eth_getCode`](/base-account/reference/core/provider-rpc-methods/eth_getCode)
- [`eth_getStorageAt`](/base-account/reference/core/provider-rpc-methods/eth_getStorageAt)
- [`eth_getLogs`](/base-account/reference/core/provider-rpc-methods/eth_getLogs)
- [`eth_getProof`](/base-account/reference/core/provider-rpc-methods/eth_getProof)
- [`eth_getUncleCountByBlockHash`](/base-account/reference/core/provider-rpc-methods/eth_getUncleCountByBlockHash)
- [`eth_getUncleCountByBlockNumber`](/base-account/reference/core/provider-rpc-methods/eth_getUncleCountByBlockNumber)
- [`eth_sendRawTransaction`](/base-account/reference/core/provider-rpc-methods/eth_sendRawTransaction)

<BaseBanner
id="privacy-policy"
dismissable={false}
content={({ onDismiss }) => (

 <div className="flex items-center">
 <div className="mr-2">
 We're updating the Base Privacy Policy, effective July 25, 2025, to reflect an expansion of Base services. Please review the updated policy here:{" "}
 <a
 href="https://docs.base.org/privacy-policy-2025
 target="_blank"
 className="whitespace-nowrap"
 >
 Base Privacy Policy
 </a>. By continuing to use Base services, you confirm that you have read and understand the updated policy.
 </div>
 <Button onClick={onDismiss}>I Acknowledge</Button>
 </div>
)}
/>

#### Ek Varyant 2

> An overview of this course.

#### Ek Varyant 3

Welcome! The course you are about to begin will rapidly introduce you to frontend web development for onchain apps and enable you to write websites that can call your smart contract functions in a similar way to how traditional sites interact with APIs.

## Prerequisites

Before these lessons, you should:

- Be comfortable with traditional frontend development using React, ideally with NextJS
- Possess a general understanding of the EVM and smart contracts

---

## Objectives

By the end of this course, you should be able to:

- **Frontend Setup**
- Identify the role of a wallet aggregator in an onchain app
- Debate the pros and cons of using a template
- Scaffold a new onchain app with RainbowKit
- Add a wallet connection to a standard template app
- **Connecting to the Blockchain**
- Compare and contrast public providers vs. vendor providers vs. wallet providers
- Select the appropriate provider for several use cases
- Set up a provider in wagmi and use it to connect a wallet
- Protect API keys that will be exposed to the front end
- **Reading and Displaying Data**
- Implement the `useAccount`hook to show the user's address, connection state, network, and balance
- Implement an`isMounted`hook to prevent hydration errors
- Implement wagmi's`useReadContract`hook to fetch data from a smart contract
- Convert data fetched from a smart contract to information displayed to the user
- Identify the caveats of reading data from automatically-generated getters
- Enable the`watch`feature of`useReadContract`to automatically fetch updates from the blockchain
- Describe the costs of using the`watch`feature, and methods to reduce those costs
- Configure arguments to be passed with a call to a`pure`or`view`smart contract function
- Call an instance of`useReadContract`on demand
- Utilize`isLoading`and`isFetching`to improve user experience
- **Writing to Contracts**
- Implement wagmi's`useWriteContract`hook to send transactions to a smart contract
- Configure the options in`useWriteContract`\* Display the execution, success, or failure of a function with button state changes, and data display
- Implement Wagmi's`usePrepareContractWrite`and`useWriteContract`to send transactions to a smart contract
- Configure the options in`useSimulateContract`and`useWriteContract`\* Call a smart contract function on-demand using the write function from`useWriteContract`, with arguments and a value

---

# wallet_connect

> Connect wallet and request account access

export const Button = ({children, disabled, variant = "primary", size = "medium", iconName, roundedFull = false, className = '', fullWidth = false, onClick = undefined}) => {
const variantStyles = {
primary: 'bg-blue text-black border border-blue hover:bg-blue-80 active:bg-[#06318E] dark:text-white',
secondary: 'bg-white border border-white text-palette-foreground hover:bg-zinc-15 active:bg-zinc-30',
outlined: 'bg-transparent text-white border border-white hover:bg-white hover:text-black active:bg-[#E3E7E9]'
};
const sizeStyles = {
medium: 'text-md px-4 py-2 gap-3',
large: 'text-lg px-6 py-4 gap-5'
};
const sizeIconRatio = {
medium: '0.75rem',
large: '1rem'
};
const classes = ['text-md px-4 py-2 whitespace-nowrap', 'flex items-center justify-center', 'disabled:opacity-40 disabled:pointer-events-none', 'transition-all', variantStyles[variant], sizeStyles[size], roundedFull ? 'rounded-full' : 'rounded-lg', fullWidth ? 'w-full' : 'w-auto', className];
const buttonClasses = classes.filter(Boolean).join(' ');
const iconSize = sizeIconRatio[size];
return <button type="button" disabled={disabled} className={buttonClasses} onClick={onClick}>
<span>{children}</span>
{iconName && <Icon name={iconName} width={iconSize} height={iconSize} color="currentColor" />}
</button>;
};

export const BaseBanner = ({content = null, id, dismissable = true}) => {
const LOCAL_STORAGE_KEY_PREFIX = 'cb-docs-banner';
const [isVisible, setIsVisible] = useState(false);
const onDismiss = => {
localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}-${id}`, 'false');
setIsVisible(false);
};
useEffect( => {
const storedValue = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}-${id}`);
setIsVisible(storedValue !== 'false');
}, []);
if (!isVisible) {
return null;
}
return <div className="fixed bottom-0 left-0 right-0 bg-white py-8 px-4 lg:px-12 z-50 text-black dark:bg-black dark:text-white border-t dark:border-gray-95">

 <div className="flex items-center max-w-8xl mx-auto">
 {typeof content === 'function' ? content({
 onDismiss
 }) : content}
 {dismissable && <button onClick={onDismiss} className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" aria-label="Dismiss banner">
 ✕
 </button>}
 </div>
 </div>;
};

Custom Coinbase Wallet method for establishing connection

<Info>
 Requests that the wallet connects to the dApp and provides account access. This is similar to `eth_requestAccounts`but provides additional connection features.
</Info>

## Parameters

<ParamField body="options" type="object">
 Optional configuration object for the connection.

 <Expandable title="Options properties">
 <ParamField body="version" type="string">
 The wallet connect version to use.
 </ParamField>

 <ParamField body="jsonrpc" type="string">
 The JSON-RPC version (typically "2.0").
 </ParamField>

 <ParamField body="capabilities" type="object">
 Optional capabilities to request during connection, such as signInWithEthereum for authentication.

 <Expandable title="Available capabilities">
 <ParamField body="signInWithEthereum" type="object">
 Request SIWE (Sign-In With Ethereum) authentication during connection.

 <Expandable title="signInWithEthereum properties">
 <ParamField body="nonce" type="string" required>
 A unique random string to prevent replay attacks.
 </ParamField>

 <ParamField body="chainId" type="string" required>
 The chain ID as a hexadecimal string (e.g., "0x2105" for Base Mainnet).
 </ParamField>
 </Expandable>
 </ParamField>
 </Expandable>
 </ParamField>
 </Expandable>
</ParamField>

## Returns

<ResponseField name="result" type="object">
 Connection result object containing account information and capabilities results.

 <Expandable title="Result properties">
 <ResponseField name="accounts" type="array">
 Array of connected account objects.

 <Expandable title="Account object properties">
 <ResponseField name="address" type="string">
 The account address.
 </ResponseField>

 <ResponseField name="capabilities" type="object">
 Capabilities results if requested during connection.

 <Expandable title="Capabilities results">
 <ResponseField name="signInWithEthereum" type="object">
 SIWE authentication result if requested.

 <Expandable title="signInWithEthereum result">
 <ResponseField name="message" type="string">
 The SIWE-formatted message that was signed.
 </ResponseField>

 <ResponseField name="signature" type="string">
 The cryptographic signature of the message.
 </ResponseField>
 </Expandable>
 </ResponseField>
 </Expandable>
 </ResponseField>
 </Expandable>
 </ResponseField>

 <ResponseField name="chainId" type="string">
 The current chain ID as a hexadecimal string.
 </ResponseField>

 <ResponseField name="isConnected" type="boolean">
 Whether the wallet is connected.
 </ResponseField>
 </Expandable>
</ResponseField>

<RequestExample>
#### JSON```json
 {
"id": 1,
"jsonrpc": "2.0",
"method": "wallet_connect",
"params": [{}]
 }
```#### JSON```json
 {
"id": 1,
"jsonrpc": "2.0",
"method": "wallet_connect",
"params": [{
 "version": "1.0",
 "jsonrpc": "2.0"
}]
 }
```#### JSON```json
 {
"id": 1,
"jsonrpc": "2.0",
"method": "wallet_connect",
"params": [{
 "version": "1",
 "capabilities": {
"signInWithEthereum": {
 "nonce": "abc123def456",
 "chainId": "0x2105"
}
 }
}]
 }
```</RequestExample>

<ResponseExample>
#### JSON```json
 {
"id": 1,
"jsonrpc": "2.0",
"result": {
 "accounts": [{
"address": "0x407d73d8a49eeb85d32cf465507dd71d507100c1"
 }],
 "chainId": "0x2105",
 "isConnected": true
}
 }
```#### JSON```json
 {
"id": 1,
"jsonrpc": "2.0",
"result": {
 "accounts": [{
"address": "0x407d73d8a49eeb85d32cf465507dd71d507100c1",
"capabilities": {
 "signInWithEthereum": {
"message": "localhost:3000 wants you to sign in with your Ethereum account:\n0x407d73d8a49eeb85d32cf465507dd71d507100c1\n\nSign in with Ethereum to the app.\n\nURI: http://localhost:3000\nVersion: 1\nChain ID: 8453\nNonce: abc123def456\nIssued At: 2024-01-15T10:30:00Z",
"signature": "0x1234567890abcdef..."
 }
}
 }],
 "chainId": "0x2105",
 "isConnected": true
}
 }
```</ResponseExample>

## Error Handling

| Code   | Message                        | Description                                               |
| ------ | ------------------------------ | --------------------------------------------------------- |
| 4001   | User rejected the request      | User denied the connection request                        |
| 4100   | Requested method not supported | The method is not supported by the wallet                 |
| 4200   | Wallet not available           | The wallet is not installed or available                  |
| -32602 | Invalid params                 | Invalid nonce or chainId in signInWithEthereum capability |

> Warning:
> This is a Coinbase Wallet-specific method and may not be available in other wallets.

<Info>
 After successful connection, the wallet will emit connection events and provide access to account information.
</Info>

> Note:
> When using the`signInWithEthereum`capability, always generate a fresh, unique nonce for each authentication attempt to prevent replay attacks. The signature can be verified on your backend using libraries like viem.

## Usage with Capabilities

You can use the`wallet_connect` with the [`signInWithEthereum`](/base-account/reference/core/capabilities/signInWithEthereum.mdx) capability to authenticate the user.

<BaseBanner
id="privacy-policy"
dismissable={false}
content={({ onDismiss }) => (

 <div className="flex items-center">
 <div className="mr-2">
 We're updating the Base Privacy Policy, effective July 25, 2025, to reflect an expansion of Base services. Please review the updated policy here:{" "}
 <a
 href="https://docs.base.org/privacy-policy-2025
 target="_blank"
 className="whitespace-nowrap"
 >
 Base Privacy Policy
 </a>. By continuing to use Base services, you confirm that you have read and understand the updated policy.
 </div>
 <Button onClick={onDismiss}>I Acknowledge</Button>
 </div>
)}
/>

# wallet_sendCalls

> Submit a batch of calls to the wallet for execution

Defined in [EIP-5792](https://eips.ethereum.org/EIPS/eip-5792)

<Info>
 Requests that the wallet submits a batch of calls. This method allows applications to send multiple transactions atomically or sequentially.
</Info>

## Parameters

<ParamField body="version" type="string" required>
 The version of the API format. This must be "2.0.0".
</ParamField>

<ParamField body="id" type="string">
 The ID of the batch of calls for tracking purposes.
</ParamField>

<ParamField body="from" type="string" required>
 The sender's address.
 Pattern: `^0x[0-9a-fA-F]{40}$`</ParamField>

<ParamField body="chainId" type="string" required>
 The EIP-155 chain ID of the calls. This must match the currently selected network in the wallet.
 Pattern:`^0x([1-9a-f]+[0-9a-f]*|0)$`</ParamField>

<ParamField body="atomicRequired" type="boolean" required>`true`if the wallet must execute all calls atomically. If`false`, the wallet may execute the calls sequentially without atomicity. If `false`and the wallet is capable of executing the calls atomically, it may do so.
</ParamField>

<ParamField body="calls" type="array" required>
 An array of call objects to execute.

 <Expandable title="Call object structure">
 <ParamField body="to" type="string" required>
 The recipient address for the call.
 </ParamField>

 <ParamField body="value" type="string" required>
 The value to send with the call (in wei, hex format).
 </ParamField>

 <ParamField body="data" type="string">
 The call data (optional, hex format).
 </ParamField>
 </Expandable>
</ParamField>

<ParamField body="capabilities" type="object">
 Dapps can use this object to communicate with the wallet about supported capabilities.
</ParamField>

## Returns

<ResponseField name="result" type="object">
 An object containing information about the sent batch, including transaction details and status.
</ResponseField>

## Example Usage

<RequestExample>
#### JSON```json
 {
"id": 1,
"jsonrpc": "2.0",
"method": "wallet_sendCalls",
"params": [{
 "version": "2.0.0",
 "from": "0xd46e8dd67c5d32be8058bb8eb970870f07244567",
 "chainId": "0xaa36a7",
 "atomicRequired": true,
 "calls": [
{
 "to": "0x54f1C1965B355e1AB9ec3465616136be35bb5Ff7",
 "value": "0x0"
},
{
 "to": "0x2D48e6f5Ae053e4E918d2be53570961D880905F2",
 "value": "0x0"
}
 ]
}]
 }
```</RequestExample>

<ResponseExample>
#### JSON```json
 {
"id": 1,
"jsonrpc": "2.0",
"result": {
 "batchId": "0x123...",
 "status": "pending"
}
 }
```</ResponseExample>

## Error Handling

<ResponseField name="code" type="number">
 Error code indicating the type of error that occurred.
</ResponseField>

<ResponseField name="message" type="string">
 Human-readable error message describing what went wrong.
</ResponseField>

| Code   | Message                                                                  | Description                 |
| ------ | ------------------------------------------------------------------------ | --------------------------- |
| -32602 | The wallet cannot parse the request                                      | Invalid request format      |
| -32000 | Version not supported                                                    | API version not supported   |
| 4001   | User rejected the request                                                | User denied the transaction |
| 4100   | The requested account and/or method has not been authorized by the user  | Authorization required      |
| 5700   | The wallet does not support a capability that was not marked as optional | Missing capability          |
| 5710   | EIP-7702 not supported on the specified chain ID                         | Chain not supported         |
| 5720   | There is already a batch submitted with the specified batch ID           | Duplicate batch ID          |
| 5740   | The batch is too large for the wallet to process                         | Batch size limit exceeded   |
| 5750   | EIP-7702 upgrade rejected for this chain and account                     | Upgrade rejected            |

> Warning:
> Ensure that the`chainId`matches the currently selected network in the wallet to avoid transaction failures.

> Note:
> When`atomicRequired`is set to`false`, consider the implications of partial execution if some calls fail while others succeed.

# wallet_getCallsStatus

> Get the status of a call batch sent via wallet_sendCalls

export const Button = ({children, disabled, variant = "primary", size = "medium", iconName, roundedFull = false, className = '', fullWidth = false, onClick = undefined}) => {
const variantStyles = {
primary: 'bg-blue text-black border border-blue hover:bg-blue-80 active:bg-[#06318E] dark:text-white',
secondary: 'bg-white border border-white text-palette-foreground hover:bg-zinc-15 active:bg-zinc-30',
outlined: 'bg-transparent text-white border border-white hover:bg-white hover:text-black active:bg-[#E3E7E9]'
};
const sizeStyles = {
medium: 'text-md px-4 py-2 gap-3',
large: 'text-lg px-6 py-4 gap-5'
};
const sizeIconRatio = {
medium: '0.75rem',
large: '1rem'
};
const classes = ['text-md px-4 py-2 whitespace-nowrap', 'flex items-center justify-center', 'disabled:opacity-40 disabled:pointer-events-none', 'transition-all', variantStyles[variant], sizeStyles[size], roundedFull ? 'rounded-full' : 'rounded-lg', fullWidth ? 'w-full' : 'w-auto', className];
const buttonClasses = classes.filter(Boolean).join(' ');
const iconSize = sizeIconRatio[size];
return <button type="button" disabled={disabled} className={buttonClasses} onClick={onClick}>
<span>{children}</span>
{iconName && <Icon name={iconName} width={iconSize} height={iconSize} color="currentColor" />}
</button>;
};

export const BaseBanner = ({content = null, id, dismissable = true}) => {
const LOCAL_STORAGE_KEY_PREFIX = 'cb-docs-banner';
const [isVisible, setIsVisible] = useState(false);
const onDismiss = => {
localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}-${id}`, 'false');
setIsVisible(false);
};
useEffect( => {
const storedValue = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}-${id}`);
setIsVisible(storedValue !== 'false');
}, []);
if (!isVisible) {
return null;
}
return <div className="fixed bottom-0 left-0 right-0 bg-white py-8 px-4 lg:px-12 z-50 text-black dark:bg-black dark:text-white border-t dark:border-gray-95">

 <div className="flex items-center max-w-8xl mx-auto">
 {typeof content === 'function' ? content({
 onDismiss
 }) : content}
 {dismissable && <button onClick={onDismiss} className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" aria-label="Dismiss banner">
 ✕
 </button>}
 </div>
 </div>;
};

Defined in [EIP-5792](https://eips.ethereum.org/EIPS/eip-5792)

<Info>
 Returns the status of a call batch that was sent via `wallet_sendCalls`. This method allows applications to track the execution status and retrieve transaction receipts for batch operations.
</Info>

## Parameters

<ParamField body="callsId" type="string" required>
 The call bundle identifier returned by a previous `wallet_sendCalls`request.
</ParamField>

## Returns

<ResponseField name="result" type="object">
 Status information for the call batch.

 <Expandable title="CallsStatus properties">
 <ResponseField name="version" type="string">
 The version of the API being used. Currently "1.0".
 </ResponseField>

 <ResponseField name="chainId" type="string">
 The chain ID in hexadecimal format.
 </ResponseField>

 <ResponseField name="id" type="string">
 The call bundle identifier.
 </ResponseField>

 <ResponseField name="status" type="number">
 Status code indicating the current state of the batch:

- **1xx (Pending)**: 100 = Batch received but not completed onchain
- **2xx (Confirmed)**: 200 = Batch included onchain without reverts
- **4xx (Offchain failures)**: 400 = Batch failed and wallet will not retry
- **5xx (Chain failures)**: 500 = Batch reverted completely
- **6xx (Partial failures)**: 600 = Batch reverted partially
  </ResponseField>

 <ResponseField name="atomic" type="boolean">
 Indicates whether the wallet executed calls atomically. If`true`, all calls were executed in a single transaction. If `false`, calls were executed in multiple transactions.
 </ResponseField>

 <ResponseField name="receipts" type="Receipt[]">
 Transaction receipts for the call batch. Structure depends on the `atomic`field:

- If`atomic`is`true`: Single receipt or array of receipts for the batch transaction
- If `atomic`is`false`: Array of receipts for all transactions containing batch calls

 <Expandable title="Receipt properties">
 <ResponseField name="logs" type="Log[]">
 The logs generated by the calls. For smart contract wallets, only includes logs relevant to the specific calls.
 </ResponseField>

 <ResponseField name="status" type="'0x1' | '0x0'">
 Transaction status: `0x1`for success,`0x0`for failure.
 </ResponseField>

 <ResponseField name="blockHash" type="string">
 Hash of the block containing these calls.
 </ResponseField>

 <ResponseField name="blockNumber" type="string">
 Block number containing these calls (hex format).
 </ResponseField>

 <ResponseField name="gasUsed" type="string">
 The amount of gas used by these calls (hex format).
 </ResponseField>

 <ResponseField name="transactionHash" type="string">
 Hash of the transaction containing these calls.
 </ResponseField>
 </Expandable>
 </ResponseField>

 <ResponseField name="capabilities" type="object">
 Optional capability-specific metadata.
 </ResponseField>
 </Expandable>
</ResponseField>

## Example Usage

<RequestExample>
#### JSON```json
 {
"id": 1,
"jsonrpc": "2.0",
"method": "wallet_getCallsStatus",
"params": ["0xe670ec64341771606e55d6b4ca35a1a6b75ee3d5145a99d05921026d1527331"]
 }
```#### Code```typescript
 import { createBaseAccountSDK } from '@base-org/account';

const provider = createBaseAccountSDK.getProvider;

// Get status of a batch sent via wallet_sendCalls
const callsId = "0xe670ec64341771606e55d6b4ca35a1a6b75ee3d5145a99d05921026d1527331";

const status = await provider.request({
method: 'wallet_getCallsStatus',
params: [callsId]
});

console.log('Batch status:', status.status);
console.log('Atomic execution:', status.atomic);
console.log('Receipts:', status.receipts);

````</RequestExample>

<ResponseExample>
#### JSON```json
 {
"id": 1,
"jsonrpc": "2.0",
"result": {
 "version": "1.0",
 "chainId": "0x2105",
 "id": "0xe670ec64341771606e55d6b4ca35a1a6b75ee3d5145a99d05921026d1527331",
 "status": 200,
 "atomic": true,
 "receipts": [
{
 "logs": [
{
 "address": "0xa922b54716264130634d6ff183747a8ead91a40b",
 "topics": ["0x5a2a90727cc9d000dd060b1132a5c977c9702bb3a52afe360c9c22f0e9451a68"],
 "data": "0xabcd"
}
 ],
 "status": "0x1",
 "blockHash": "0xf19bbafd9fd0124ec110b848e8de4ab4f62bf60c189524e54213285e7f540d4a",
 "blockNumber": "0xabcd",
 "gasUsed": "0xdef",
 "transactionHash": "0x9b7bb827c2e5e3c1a0a44dc53e573aa0b3af3bd1f9f5ed03071b100bb039eaff"
}
 ]
}
 }
```#### JSON```json
 {
"id": 1,
"jsonrpc": "2.0",
"result": {
 "version": "1.0",
 "chainId": "0x2105",
 "id": "0xe670ec64341771606e55d6b4ca35a1a6b75ee3d5145a99d05921026d1527331",
 "status": 100,
 "atomic": true,
 "receipts": []
}
 }
```#### JSON```json
 {
"id": 1,
"jsonrpc": "2.0",
"result": {
 "version": "1.0",
 "chainId": "0x2105",
 "id": "0xe670ec64341771606e55d6b4ca35a1a6b75ee3d5145a99d05921026d1527331",
 "status": 500,
 "atomic": true,
 "receipts": [
{
 "logs": [],
 "status": "0x0",
 "blockHash": "0xf19bbafd9fd0124ec110b848e8de4ab4f62bf60c189524e54213285e7f540d4a",
 "blockNumber": "0xabcd",
 "gasUsed": "0xabc",
 "transactionHash": "0x9b7bb827c2e5e3c1a0a44dc53e573aa0b3af3bd1f9f5ed03071b100bb039eaff"
}
 ]
}
 }
```</ResponseExample>

## Status Code Reference

| Code | Category | Meaning |
| ---- | -------------- | ----------------------------------------------------- |
| 100 | Pending | Batch received but not completed onchain |
| 200 | Success | Batch included onchain without reverts |
| 400 | Offchain Error | Batch failed, wallet will not retry |
| 500 | Chain Error | Batch reverted completely |
| 600 | Partial Error | Batch reverted partially, some changes may be onchain |

## Error Handling

| Code | Message | Description |
| ------ | -------------------- | --------------------------------------------- |
| -32602 | Invalid params | Invalid call bundle identifier |
| 4100 | Method not supported | Wallet doesn't support wallet\_getCallsStatus |
| 4200 | Calls not found | No batch found with the specified identifier |

## Usage with wallet\_sendCalls

This method is designed to work with batches sent via`wallet_sendCalls`:
#### Code
```typescript
// Send a batch of calls
const callsId = await provider.request({
 method: 'wallet_sendCalls',
 params: [{
version: '1.0',
chainId: '0x2105',
from: userAddress,
calls: [
 { to: '0x...', value: '0x0', data: '0x...' },
 { to: '0x...', value: '0x0', data: '0x...' }
]
 }]
});

// Poll for status updates
const checkStatus = async => {
 const status = await provider.request({
method: 'wallet_getCallsStatus',
params: [callsId]
 });

 if (status.status === 200) {
console.log('Batch completed successfully!');
console.log('Transaction receipts:', status.receipts);
 } else if (status.status === 100) {
console.log('Batch still pending...');
setTimeout(checkStatus, 2000); // Check again in 2 seconds
 } else {
console.error('Batch failed with status:', status.status);
 }
};

checkStatus;
```> Warning:
The receipts structure varies based on whether the batch was executed atomically. Always check the`atomic` field to properly interpret the receipts array.

<Info>
 This method follows the EIP-5792 standard for wallet batch operations. Not all wallets may support this method - check wallet capabilities first.
</Info>

<BaseBanner
 id="privacy-policy"
 dismissable={false}
 content={({ onDismiss }) => (
 <div className="flex items-center">
 <div className="mr-2">
 We're updating the Base Privacy Policy, effective July 25, 2025, to reflect an expansion of Base services. Please review the updated policy here:{" "}
 <a
 href="https://docs.base.org/privacy-policy-2025
 target="_blank"
 className="whitespace-nowrap"
 >
 Base Privacy Policy
 </a>. By continuing to use Base services, you confirm that you have read and understand the updated policy.
 </div>
 <Button onClick={onDismiss}>I Acknowledge</Button>
 </div>
)}
/>


# wallet_getCapabilities

> Get the wallet's supported capabilities for the given account

export const Button = ({children, disabled, variant = "primary", size = "medium", iconName, roundedFull = false, className = '', fullWidth = false, onClick = undefined}) => {
 const variantStyles = {
 primary: 'bg-blue text-black border border-blue hover:bg-blue-80 active:bg-[#06318E] dark:text-white',
 secondary: 'bg-white border border-white text-palette-foreground hover:bg-zinc-15 active:bg-zinc-30',
 outlined: 'bg-transparent text-white border border-white hover:bg-white hover:text-black active:bg-[#E3E7E9]'
 };
 const sizeStyles = {
 medium: 'text-md px-4 py-2 gap-3',
 large: 'text-lg px-6 py-4 gap-5'
 };
 const sizeIconRatio = {
 medium: '0.75rem',
 large: '1rem'
 };
 const classes = ['text-md px-4 py-2 whitespace-nowrap', 'flex items-center justify-center', 'disabled:opacity-40 disabled:pointer-events-none', 'transition-all', variantStyles[variant], sizeStyles[size], roundedFull ? 'rounded-full' : 'rounded-lg', fullWidth ? 'w-full' : 'w-auto', className];
 const buttonClasses = classes.filter(Boolean).join(' ');
 const iconSize = sizeIconRatio[size];
 return <button type="button" disabled={disabled} className={buttonClasses} onClick={onClick}>
 <span>{children}</span>
 {iconName && <Icon name={iconName} width={iconSize} height={iconSize} color="currentColor" />}
 </button>;
};

export const BaseBanner = ({content = null, id, dismissable = true}) => {
 const LOCAL_STORAGE_KEY_PREFIX = 'cb-docs-banner';
 const [isVisible, setIsVisible] = useState(false);
 const onDismiss = => {
 localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}-${id}`, 'false');
 setIsVisible(false);
 };
 useEffect( => {
 const storedValue = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}-${id}`);
 setIsVisible(storedValue !== 'false');
 }, []);
 if (!isVisible) {
 return null;
 }
 return <div className="fixed bottom-0 left-0 right-0 bg-white py-8 px-4 lg:px-12 z-50 text-black dark:bg-black dark:text-white border-t dark:border-gray-95">
 <div className="flex items-center max-w-8xl mx-auto">
 {typeof content === 'function' ? content({
 onDismiss
 }) : content}
 {dismissable && <button onClick={onDismiss} className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" aria-label="Dismiss banner">
 ✕
 </button>}
 </div>
 </div>;
};

Defined in [EIP-5792](https://eips.ethereum.org/EIPS/eip-5792)

<Info>
 Returns the wallet's capabilities for a given account. Capabilities indicate what additional functionality the wallet supports beyond standard RPC methods, such as atomic batch transactions, gasless transactions, auxiliary funds, and authentication features.
</Info>

## Parameters

<ParamField body="account" type="string" required>
 The account address to check capabilities for.
 Pattern: `^0x[0-9a-fA-F]{40}$`</ParamField>

## Returns

<ResponseField name="result" type="object">
 An object where each key is a chain ID (as a hexadecimal string) and each value is an object containing the capabilities supported on that chain.

 <Expandable title="Capabilities by chain">
 <ResponseField name="[chainId]" type="object">
 Capabilities object for a specific chain (e.g., "0x2105" for Base Mainnet).

 <Expandable title="Available capabilities">
 <ResponseField name="auxiliaryFunds" type="object">
 Indicates wallet access to funds beyond on-chain balance verification (MagicSpend).

 <Expandable title="auxiliaryFunds properties">
 <ResponseField name="supported" type="boolean">
 Whether auxiliary funds are available for this account on this chain.
 </ResponseField>
 </Expandable>
 </ResponseField>

 <ResponseField name="atomic" type="object">
 Indicates support for atomic batch transaction execution.

 <Expandable title="atomic properties">
 <ResponseField name="supported" type="string">
 Atomic execution support level: "supported", "ready", or "unsupported".
 </ResponseField>
 </Expandable>
 </ResponseField>

 <ResponseField name="paymasterService" type="object">
 Indicates support for gasless transactions via paymaster services.

 <Expandable title="paymasterService properties">
 <ResponseField name="supported" type="boolean">
 Whether paymaster services are supported for this account on this chain.
 </ResponseField>
 </Expandable>
 </ResponseField>

 <ResponseField name="flowControl" type="object">
 Indicates support for flow control capabilities.

 <Expandable title="flowControl properties">
 <ResponseField name="supported" type="boolean">
 Whether flow control is supported for this account on this chain.
 </ResponseField>
 </Expandable>
 </ResponseField>

 <ResponseField name="datacallback" type="object">
 Indicates support for data callback capabilities.

 <Expandable title="datacallback properties">
 <ResponseField name="supported" type="boolean">
 Whether data callbacks are supported for this account on this chain.
 </ResponseField>
 </Expandable>
 </ResponseField>
 </Expandable>
 </ResponseField>
 </Expandable>
</ResponseField>

## Example Usage

<RequestExample>
#### JSON```json
 {
"id": 1,
"jsonrpc": "2.0",
"method": "wallet_getCapabilities",
"params": ["0x407d73d8a49eeb85d32cf465507dd71d507100c1"]
 }
```#### Code```typescript
 import { createBaseAccountSDK } from '@base-org/account';

 const provider = createBaseAccountSDK.getProvider;

 // Get capabilities for a user address
 const capabilities = await provider.request({
method: 'wallet_getCapabilities',
params: ['0x407d73d8a49eeb85d32cf465507dd71d507100c1']
 });

 // Check specific capabilities
 const baseCapabilities = capabilities["0x2105"]; // Base Mainnet
 const hasAuxiliaryFunds = baseCapabilities?.auxiliaryFunds?.supported;
 const supportsAtomic = baseCapabilities?.atomic?.supported === "supported";
 const hasPaymaster = baseCapabilities?.paymasterService?.supported;

 console.log('Capabilities:', {
hasAuxiliaryFunds,
supportsAtomic,
hasPaymaster
 });
```</RequestExample>

<ResponseExample>
#### JSON```json
 {
"id": 1,
"jsonrpc": "2.0",
"result": {
 "0x2105": {
"auxiliaryFunds": {
 "supported": true
},
"atomic": {
 "supported": "supported"
},
"paymasterService": {
 "supported": true
},
"flowControl": {
 "supported": false
},
"datacallback": {
 "supported": false
}
 },
 "0x14A34": {
"auxiliaryFunds": {
 "supported": false
},
"atomic": {
 "supported": "ready"
},
"paymasterService": {
 "supported": true
}
 }
}
 }
```#### JSON```json
 {
"id": 1,
"jsonrpc": "2.0",
"result": {
 "0x2105": {
"auxiliaryFunds": {
 "supported": false
},
"atomic": {
 "supported": "unsupported"
},
"paymasterService": {
 "supported": false
}
 }
}
 }
```</ResponseExample>

## Capability Detection Patterns

### Check Single Capability
#### Code```typescript
async function checkAuxiliaryFunds(userAddress: string): Promise<boolean> {
 try {
const capabilities = await provider.request({
 method: 'wallet_getCapabilities',
 params: [userAddress]
});

return capabilities["0x2105"]?.auxiliaryFunds?.supported || false;
 } catch (error) {
console.error('Failed to check capabilities:', error);
return false;
 }
}
```### Check Multiple Capabilities
#### Code```typescript
async function getWalletCapabilities(userAddress: string) {
 const capabilities = await provider.request({
method: 'wallet_getCapabilities',
params: [userAddress]
 });

 const baseCapabilities = capabilities["0x2105"] || {};

 return {
hasAuxiliaryFunds: baseCapabilities.auxiliaryFunds?.supported || false,
hasAtomicBatch: baseCapabilities.atomic?.supported === "supported",
hasPaymaster: !!baseCapabilities.paymasterService?.supported,
hasFlowControl: !!baseCapabilities.flowControl?.supported,
hasDataCallback: !!baseCapabilities.datacallback?.supported
 };
}
```### Conditional Transaction Building
#### Code```typescript
async function buildTransaction(userAddress: string, calls: any[]) {
 const capabilities = await provider.request({
method: 'wallet_getCapabilities',
params: [userAddress]
 });

 const baseCapabilities = capabilities["0x2105"] || {};

 const txParams: any = {
version: '1.0',
chainId: '0x2105',
from: userAddress,
calls
 };

 // Add gasless capability if supported
 if (baseCapabilities.paymasterService?.supported) {
txParams.capabilities = {
 paymasterService: {
url: "https://paymaster.base.org/api/v1/sponsor
 }
};
 }

 // Use atomic execution if supported and multiple calls
 if (calls.length > 1 && baseCapabilities.atomic?.supported === "supported") {
txParams.atomicRequired = true;
 }

 return txParams;
}
```## Error Handling

| Code | Message | Description |
| ------ | -------------------- | ---------------------------------------------- |
| -32602 | Invalid params | Invalid account address format |
| 4100 | Method not supported | Wallet doesn't support wallet\_getCapabilities |
| 4200 | Wallet not available | Wallet is not installed or available |


> Warning:
Capabilities are chain-specific and account-specific. Always check capabilities for the specific chain and account combination you're targeting.

<Info>
 Not all wallets support all capabilities. Use capability detection to provide progressive enhancement rather than blocking functionality when capabilities aren't available.
</Info>

## Integration with Other Methods

### With wallet\_sendCalls

Use capabilities to enhance transaction execution:
#### Code```typescript
const capabilities = await provider.request({
 method: 'wallet_getCapabilities',
 params: [userAddress]
});

// Use capabilities in wallet_sendCalls
const result = await provider.request({
 method: 'wallet_sendCalls',
 params: [{
version: '1.0',
chainId: '0x2105',
from: userAddress,
atomicRequired: capabilities["0x2105"]?.atomic?.supported === "supported",
calls: [{
 to: '0x...',
 value: '0x0',
 data: '0x...'
}],
capabilities: {
 paymasterService: capabilities["0x2105"]?.paymasterService?.supported ? {
url: "https://paymaster.base.org/api/v1/sponsor
 } : undefined
}
 }]
});
```### With wallet\_connect

Capabilities detection doesn't affect wallet\_connect, but you can use the results to inform your authentication flow:
#### Code```typescript
const capabilities = await provider.request({
 method: 'wallet_getCapabilities',
 params: [userAddress]
});

// signInWithEthereum is always available with wallet_connect
const { accounts } = await provider.request({
 method: 'wallet_connect',
 params: [{
version: '1',
capabilities: {
 signInWithEthereum: {
nonce: generateNonce,
chainId: '0x2105'
 }
}
 }]
});
```## Best Practices

1. **Always Check First**: Call`wallet_getCapabilities`before using advanced features
2. **Cache Results**: Capabilities typically don't change frequently, consider caching
3. **Graceful Fallbacks**: Implement fallback behavior when capabilities aren't supported
4. **Chain-Specific**: Check capabilities for each chain your app supports
5. **Progressive Enhancement**: Use capabilities to enhance UX, not gate basic functionality

## Related Documentation

* [Capabilities Overview](/base-account/reference/core/capabilities/overview) - Complete guide to using capabilities
* [wallet\_sendCalls](/base-account/reference/core/provider-rpc-methods/wallet_sendCalls) - Execute transactions with capabilities
* [wallet\_connect](/base-account/reference/core/provider-rpc-methods/wallet_connect) - Connect with authentication capabilities

<BaseBanner
 id="privacy-policy"
 dismissable={false}
 content={({ onDismiss }) => (
 <div className="flex items-center">
 <div className="mr-2">
 We're updating the Base Privacy Policy, effective July 25, 2025, to reflect an expansion of Base services. Please review the updated policy here:{" "}
 <a
 href="https://docs.base.org/privacy-policy-2025
 target="_blank"
 className="whitespace-nowrap"
 >
 Base Privacy Policy
 </a>. By continuing to use Base services, you confirm that you have read and understand the updated policy.
 </div>
 <Button onClick={onDismiss}>I Acknowledge</Button>
 </div>
)}
/>


# wallet_addSubAccount

> Add a sub account to the wallet

Experimental RPC method for creating sub accounts

<Info>
 Creates a new sub account associated with the main wallet account. Sub accounts allow for hierarchical account management and delegation.
</Info>

## Parameters

<ParamField body="account" type="object" required>
 The account configuration object.

 <Expandable title="Account object properties">
 <ParamField body="type" type="string" required>
 The type of sub account to create. Can be "create" or "deployed".
 </ParamField>

 <ParamField body="keys" type="array">
 Array of key objects for the sub account (required for "create" type).

 <Expandable title="Key object properties">
 <ParamField body="type" type="string" required>
 Type of key: "address", "p256", "webcrypto-p256", or "webauthn-p256".
 </ParamField>

 <ParamField body="publicKey" type="string" required>
 Hex string of the public key.
 </ParamField>
 </Expandable>
 </ParamField>

 <ParamField body="address" type="string">
 The address of the deployed account to add as a sub account. (required for "deployed" type).
 </ParamField>

 <ParamField body="chainId" type="number">
 The chain ID that the account is deployed on. (required for "deployed" type).
 </ParamField>
 </Expandable>
</ParamField>

## Returns

<ResponseField name="result" type="object">
 Sub account information including address and deployment details.

 <Expandable title="Result properties">
 <ResponseField name="address" type="string">
 The address of the created sub account.
 </ResponseField>

 <ResponseField name="factory" type="string">
 The factory contract address (optional).
 </ResponseField>

 <ResponseField name="factoryData" type="string">
 Factory deployment data (optional).
 </ResponseField>
 </Expandable>
</ResponseField>

<RequestExample>
#### JSON```json
 {
"id": 1,
"jsonrpc": "2.0",
"method": "wallet_addSubAccount",
"params": [{
 "account": {
"type": "create",
"keys": [{
 "type": "p256",
 "publicKey": "0x0123456789abcdef..."
}]
 }
}]
 }
```#### JSON```json
 {
"id": 1,
"jsonrpc": "2.0",
"method": "wallet_addSubAccount",
"params": [{
 "account": {
"type": "deployed",
"address": "0x1234567890123456789012345678901234567890",
"chainId": 8453
 }
}]
 }
```</RequestExample>

<ResponseExample>
#### JSON```json
 {
"id": 1,
"jsonrpc": "2.0",
"result": {
 "address": "0x1234567890123456789012345678901234567890",
 "chainId": "0x2105"
}
 }
```</ResponseExample>

## Error Handling

| Code | Message | Description |
| ------ | ------------------------------ | ----------------------------------------- |
| 4001 | User rejected the request | User denied creating the sub account |
| 4100 | Requested method not supported | The method is not supported by the wallet |
| -32602 | Invalid params | Invalid account configuration |


> Warning:
This is an experimental feature and the API may change in future versions.

# wallet_getSubAccounts

> Fetch the sub accounts of the wallet

Experimental RPC method for fetching sub accounts

<Info>
 Fetches the sub accounts associated with the main wallet account. Sub accounts allow for hierarchical account management and delegation.
</Info>

## Parameters

<ParamField body="account" type="string" required>
 The address of the main wallet account.

 <ParamField body="domain" type="string" required>
 The fully qualified domain name of the app that the sub account is associated with.
 </ParamField>
</ParamField>

## Returns

<ResponseField name="result" type="object">
 Sub account information including address and deployment details.

 <Expandable title="Result properties">
 <ResponseField name="subAccounts" type="array">
 Array of sub account information.

 <Expandable title="Sub account properties">
 <ResponseField name="address" type="string">
 The address of the created sub account.
 </ResponseField>

 <ResponseField name="factory" type="string">
 The factory contract address.
 </ResponseField>

 <ResponseField name="factoryData" type="string">
 Factory deployment data.
 </ResponseField>
 </Expandable>
 </ResponseField>
 </Expandable>
</ResponseField>

<RequestExample>
#### JSON```json
 {
"id": 1,
"jsonrpc": "2.0",
"method": "wallet_getSubAccounts",
"params": [{
 "account": "0x1234567890123456789012345678901234567890",
 "domain": "https://app.example.com
}]
 }
```</RequestExample>

<ResponseExample>
#### JSON```json
 {
"id": 1,
"jsonrpc": "2.0",
"result": {
 "subAccounts": [
{
 "address": "0x2345678901234567890123456789012345678901",
 "factory": "0x1234567890123456789012345678901234567890",
 "factoryData": "0x1234567890123456789012345678901234567890"
}
 ]
}
 }
````

</ResponseExample>

## Error Handling

| Code   | Message                        | Description                               |
| ------ | ------------------------------ | ----------------------------------------- |
| 4100   | Requested method not supported | The method is not supported by the wallet |
| -32602 | Invalid params                 | Invalid account configuration             |

> Warning:
> This is an experimental feature and the API may change in future versions.

## CAPABILITIES

# Capabilities Overview

> Understand how to use Base Account capabilities with wallet_connect and wallet_sendCalls

export const Button = ({children, disabled, variant = "primary", size = "medium", iconName, roundedFull = false, className = '', fullWidth = false, onClick = undefined}) => {
const variantStyles = {
primary: 'bg-blue text-black border border-blue hover:bg-blue-80 active:bg-[#06318E] dark:text-white',
secondary: 'bg-white border border-white text-palette-foreground hover:bg-zinc-15 active:bg-zinc-30',
outlined: 'bg-transparent text-white border border-white hover:bg-white hover:text-black active:bg-[#E3E7E9]'
};
const sizeStyles = {
medium: 'text-md px-4 py-2 gap-3',
large: 'text-lg px-6 py-4 gap-5'
};
const sizeIconRatio = {
medium: '0.75rem',
large: '1rem'
};
const classes = ['text-md px-4 py-2 whitespace-nowrap', 'flex items-center justify-center', 'disabled:opacity-40 disabled:pointer-events-none', 'transition-all', variantStyles[variant], sizeStyles[size], roundedFull ? 'rounded-full' : 'rounded-lg', fullWidth ? 'w-full' : 'w-auto', className];
const buttonClasses = classes.filter(Boolean).join(' ');
const iconSize = sizeIconRatio[size];
return <button type="button" disabled={disabled} className={buttonClasses} onClick={onClick}>
<span>{children}</span>
{iconName && <Icon name={iconName} width={iconSize} height={iconSize} color="currentColor" />}
</button>;
};

export const BaseBanner = ({content = null, id, dismissable = true}) => {
const LOCAL_STORAGE_KEY_PREFIX = 'cb-docs-banner';
const [isVisible, setIsVisible] = useState(false);
const onDismiss = => {
localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}-${id}`, 'false');
setIsVisible(false);
};
useEffect( => {
const storedValue = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}-${id}`);
setIsVisible(storedValue !== 'false');
}, []);
if (!isVisible) {
return null;
}
return <div className="fixed bottom-0 left-0 right-0 bg-white py-8 px-4 lg:px-12 z-50 text-black dark:bg-black dark:text-white border-t dark:border-gray-95">

 <div className="flex items-center max-w-8xl mx-auto">
 {typeof content === 'function' ? content({
 onDismiss
 }) : content}
 {dismissable && <button onClick={onDismiss} className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" aria-label="Dismiss banner">
 ✕
 </button>}
 </div>
 </div>;
};

Base Account supports various capabilities that extend functionality beyond standard wallet operations. Capabilities are feature flags that indicate what additional functionality a wallet supports for specific chains and accounts.

## Core Concepts

Capabilities are discovered using `wallet_getCapabilities`and utilized through`wallet_connect`and`wallet_sendCalls`methods. Each capability is chain-specific and may have different availability depending on the account type.

### Discovery Pattern

#### Code```typescript

// Check what capabilities are available
const capabilities = await provider.request({
method: 'wallet_getCapabilities',
params: [userAddress]
});

// Check specific capability for Base mainnet
const baseCapabilities = capabilities["0x2105"]; // Base mainnet chain ID

````## Available Capabilities

| Capability | Method | Description |
| ---------------------------------------------------------------------------------- | ------------------ | ------------------------------------------ |
| [signInWithEthereum](/base-account/reference/core/capabilities/signInWithEthereum) |`wallet_connect`| SIWE authentication |
| [auxiliaryFunds](/base-account/reference/core/capabilities/auxiliaryFunds) |`wallet_sendCalls`| MagicSpend - use Coinbase balances onchain |
| [atomic](/base-account/reference/core/capabilities/atomic) |`wallet_sendCalls`| Atomic batch transactions |
| [paymasterService](/base-account/reference/core/capabilities/paymasterService) |`wallet_sendCalls`| Gasless transactions |
| [flowControl](/base-account/reference/core/capabilities/flowControl) |`wallet_sendCalls`| Flow control |
| [datacallback](/base-account/reference/core/capabilities/datacallback) |`wallet_sendCalls`| Data callback |

## Using with wallet\_connect

The`wallet_connect`method supports capabilities for connection and authentication:

### Basic Connection
#### Code```typescript
// Simple connection without capabilities
const result = await provider.request({
 method: 'wallet_connect',
 params: [{
version: '1'
 }]
});
```### Authentication with signInWithEthereum
#### Code```typescript
// Generate nonce for security
const nonce = window.crypto.randomUUID.replace(/-/g, '');

const { accounts } = await provider.request({
 method: 'wallet_connect',
 params: [{
version: '1',
capabilities: {
 signInWithEthereum: {
nonce,
chainId: '0x2105' // Base Mainnet
 }
}
 }]
});

// Extract authentication data
const { address } = accounts[0];
const { message, signature } = accounts[0].capabilities.signInWithEthereum;

// Verify signature on your backend
await fetch('/auth/verify', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ address, message, signature })
});
```## Using with wallet\_sendCalls

The`wallet_sendCalls`method supports transaction-related capabilities:

### Basic Transaction
#### Code```typescript
// Simple transaction without capabilities
const result = await provider.request({
 method: 'wallet_sendCalls',
 params: [{
version: '1.0',
chainId: '0x2105',
from: userAddress,
calls: [{
 to: '0x...',
 value: '0x0',
 data: '0x...'
}]
 }]
});
```### Gasless Transactions with Paymaster
#### Code```typescript
await provider.request({
 method: 'wallet_sendCalls',
 params: [{
version: '1.0',
chainId: '0x2105',
from: userAddress,
calls: [{
 to: contractAddress,
 value: '0x0',
 data: encodedFunctionCall
}],
capabilities: {
 paymasterService: {
url: "https://paymaster.base.org/api/v1/sponsor
 }
}
 }]
});
```### Atomic Batch Transactions
#### Code```typescript
await provider.request({
 method: 'wallet_sendCalls',
 params: [{
version: '1.0',
chainId: '0x2105',
from: userAddress,
atomicRequired: true, // Require atomic execution
calls: [
 {
to: tokenAddress,
value: '0x0',
data: approveCallData
 },
 {
to: dexAddress,
value: '0x0',
data: swapCallData
 }
]
 }]
});
```## Capability Detection Patterns

### Check Single Capability
#### Code```typescript
async function checkAuxiliaryFunds(address: string): Promise<boolean> {
 try {
const capabilities = await provider.request({
 method: 'wallet_getCapabilities',
 params: [address]
});

return capabilities["0x2105"]?.auxiliaryFunds?.supported || false;
 } catch (error) {
console.error('Failed to check capabilities:', error);
return false;
 }
}
```### Check Multiple Capabilities
#### Code```typescript
async function getWalletCapabilities(address: string) {
 const capabilities = await provider.request({
method: 'wallet_getCapabilities',
params: [address]
 });

 const baseCapabilities = capabilities["0x2105"] || {};

 return {
hasAuxiliaryFunds: baseCapabilities.auxiliaryFunds?.supported || false,
hasAtomicBatch: baseCapabilities.atomic?.supported === "supported",
hasPaymaster: !!baseCapabilities.paymasterService?.supported,
canAuthenticate: true // signInWithEthereum is always available with wallet_connect
 };
}
````

## Capability-Specific Guides

For detailed information on each capability:

- [signInWithEthereum](/base-account/reference/core/capabilities/signInWithEthereum) - SIWE authentication
- [auxiliaryFunds](/base-account/reference/core/capabilities/auxiliaryFunds) - MagicSpend integration
- [atomic](/base-account/reference/core/capabilities/atomic) - Atomic batch transactions
- [paymasterService](/base-account/reference/core/capabilities/paymasterService) - Gasless transactions

## Related Methods

- [`wallet_getCapabilities`](/base-account/reference/core/provider-rpc-methods/wallet_getCapabilities) - Discover available capabilities
- [`wallet_connect`](/base-account/reference/core/provider-rpc-methods/wallet_connect) - Connect with capabilities
- [`wallet_sendCalls`](/base-account/reference/core/provider-rpc-methods/wallet_sendCalls) - Execute transactions with capabilities

<BaseBanner
id="privacy-policy"
dismissable={false}
content={({ onDismiss }) => (

 <div className="flex items-center">
 <div className="mr-2">
 We're updating the Base Privacy Policy, effective July 25, 2025, to reflect an expansion of Base services. Please review the updated policy here:{" "}
 <a
 href="https://docs.base.org/privacy-policy-2025
 target="_blank"
 className="whitespace-nowrap"
 >
 Base Privacy Policy
 </a>. By continuing to use Base services, you confirm that you have read and understand the updated policy.
 </div>
 <Button onClick={onDismiss}>I Acknowledge</Button>
 </div>
)}
/>

# signInWithEthereum

> Enable secure authentication using the Sign-In With Ethereum (SIWE) standard

export const Button = ({children, disabled, variant = "primary", size = "medium", iconName, roundedFull = false, className = '', fullWidth = false, onClick = undefined}) => {
const variantStyles = {
primary: 'bg-blue text-black border border-blue hover:bg-blue-80 active:bg-[#06318E] dark:text-white',
secondary: 'bg-white border border-white text-palette-foreground hover:bg-zinc-15 active:bg-zinc-30',
outlined: 'bg-transparent text-white border border-white hover:bg-white hover:text-black active:bg-[#E3E7E9]'
};
const sizeStyles = {
medium: 'text-md px-4 py-2 gap-3',
large: 'text-lg px-6 py-4 gap-5'
};
const sizeIconRatio = {
medium: '0.75rem',
large: '1rem'
};
const classes = ['text-md px-4 py-2 whitespace-nowrap', 'flex items-center justify-center', 'disabled:opacity-40 disabled:pointer-events-none', 'transition-all', variantStyles[variant], sizeStyles[size], roundedFull ? 'rounded-full' : 'rounded-lg', fullWidth ? 'w-full' : 'w-auto', className];
const buttonClasses = classes.filter(Boolean).join(' ');
const iconSize = sizeIconRatio[size];
return <button type="button" disabled={disabled} className={buttonClasses} onClick={onClick}>
<span>{children}</span>
{iconName && <Icon name={iconName} width={iconSize} height={iconSize} color="currentColor" />}
</button>;
};

export const BaseBanner = ({content = null, id, dismissable = true}) => {
const LOCAL_STORAGE_KEY_PREFIX = 'cb-docs-banner';
const [isVisible, setIsVisible] = useState(false);
const onDismiss = => {
localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}-${id}`, 'false');
setIsVisible(false);
};
useEffect( => {
const storedValue = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}-${id}`);
setIsVisible(storedValue !== 'false');
}, []);
if (!isVisible) {
return null;
}
return <div className="fixed bottom-0 left-0 right-0 bg-white py-8 px-4 lg:px-12 z-50 text-black dark:bg-black dark:text-white border-t dark:border-gray-95">

 <div className="flex items-center max-w-8xl mx-auto">
 {typeof content === 'function' ? content({
 onDismiss
 }) : content}
 {dismissable && <button onClick={onDismiss} className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" aria-label="Dismiss banner">
 ✕
 </button>}
 </div>
 </div>;
};

Defined in [EIP-4361](https://eips.ethereum.org/EIPS/eip-4361)

<Info>
 The signInWithEthereum capability enables secure user authentication following the SIWE (Sign-In With Ethereum) standard. This capability is only available with the `wallet_connect`method and provides a standardized way to authenticate users with their Ethereum accounts.
</Info>

## Parameters

<ParamField body="nonce" type="string" required>
 A unique random string to prevent replay attacks. Should be generated fresh for each authentication attempt.
</ParamField>

<ParamField body="chainId" type="string" required>
 The chain ID as a hexadecimal string (e.g., "0x2105" for Base Mainnet).
</ParamField>

## Returns

<ResponseField name="signInWithEthereum" type="object">
 Authentication result containing the signed message and signature.

 <Expandable title="SignInWithEthereum properties">
 <ResponseField name="message" type="string">
 The SIWE-formatted message that was signed by the user.
 </ResponseField>

 <ResponseField name="signature" type="string">
 The cryptographic signature of the message, which can be verified on your backend.
 </ResponseField>
 </Expandable>
</ResponseField>

## Usage with wallet_connect

The`signInWithEthereum`capability must be used with the`wallet_connect`method:

<RequestExample>
#### Code```typescript
 import { createBaseAccountSDK } from '@base-org/account';

const provider = createBaseAccountSDK.getProvider;

// Generate a unique nonce
const nonce = window.crypto.randomUUID.replace(/-/g, '');

try {
// Connect with signInWithEthereum capability
const { accounts } = await provider.request({
method: 'wallet_connect',
params: [{
version: '1',
capabilities: {
signInWithEthereum: {
nonce,
chainId: '0x2105' // Base Mainnet
}
}
}]
});

// Extract authentication data
const { address } = accounts[0];
const { message, signature } = accounts[0].capabilities.signInWithEthereum;

console.log('User address:', address);
console.log('Signed message:', message);
console.log('Signature:', signature);
} catch (error) {
console.error('Authentication failed:', error);
}
`#### Code`typescript
import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';

const client = createPublicClient({
chain: base,
transport: http
});

export async function verifyAuthentication(req, res) {
const { address, message, signature } = req.body;

try {
// Verify the signature
const isValid = await client.verifyMessage({
address,
message,
signature
});

if (!isValid) {
return res.status(401).json({
error: 'Invalid signature'
});
}

// Create session or JWT token
const token = generateAuthToken(address);

res.json({
success: true,
token
});
} catch (error) {
console.error('Verification failed:', error);
res.status(500).json({
error: 'Verification failed'
});
}
}

````</RequestExample>

<ResponseExample>
#### JSON```json
 {
"accounts": [{
 "address": "0x1234567890123456789012345678901234567890",
 "capabilities": {
"signInWithEthereum": {
 "message": "localhost:3000 wants you to sign in with your Ethereum account:\n0x1234567890123456789012345678901234567890\n\nSign in with Ethereum to the app.\n\nURI: http://localhost:3000\nVersion: 1\nChain ID: 8453\nNonce: abc123def456\nIssued At: 2024-01-15T10:30:00Z",
 "signature": "0x1234567890abcdef..."
}
 }
}],
"chainId": "0x2105",
"isConnected": true
 }
```</ResponseExample>

## Security Considerations

### Nonce Management

Always use fresh, unique nonces for each authentication attempt:
#### Code```typescript
// Generate cryptographically secure nonce
const nonce = window.crypto.randomUUID.replace(/-/g, '');

// Or fetch from your backend
const nonce = await fetch('/auth/nonce').then(r => r.text);
```### Backend Verification

Verify signatures on your backend to prevent tampering:
#### Code```typescript
// Server-side nonce tracking
const usedNonces = new Set;

export async function verifyAuth(req, res) {
 const { address, message, signature } = req.body;

 // Extract nonce from message
 const nonce = extractNonceFromMessage(message);

 // Check if nonce has been used
 if (usedNonces.has(nonce)) {
return res.status(400).json({
 error: 'Nonce already used'
});
 }

 // Verify signature
 const isValid = await client.verifyMessage({
address,
message,
signature
 });

 if (isValid) {
usedNonces.add(nonce);
// Create session...
 }
}
```## Integration Examples

### Express.js Backend
#### Code```typescript
import express from 'express';
import crypto from 'crypto';
import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';

const app = express;
app.use(express.json);

const client = createPublicClient({ chain: base, transport: http });
const nonces = new Set<string>;

// Generate nonce endpoint
app.get('/auth/nonce', (_, res) => {
 const nonce = crypto.randomBytes(16).toString('hex');
 nonces.add(nonce);
 res.send(nonce);
});

// Verify authentication
app.post('/auth/verify', async (req, res) => {
 const { address, message, signature } = req.body;

 // Extract and validate nonce
 const nonce = message.match(/Nonce: (\w+)/)?.[1];
 if (!nonce || !nonces.delete(nonce)) {
return res.status(400).json({
 error: 'Invalid or reused nonce'
});
 }

 // Verify signature
 const valid = await client.verifyMessage({
address,
message,
signature
 });

 if (!valid) {
return res.status(401).json({
 error: 'Invalid signature'
});
 }

 // Success - create session
 res.json({ success: true });
});
```### React Integration
#### Code```tsx
import { useState } from 'react';
import { createBaseAccountSDK } from '@base-org/account';
import { SignInWithBaseButton } from '@base-org/account-ui/react';

export function AuthComponent {
 const [user, setUser] = useState(null);
 const [loading, setLoading] = useState(false);

 const handleSignIn = async => {
setLoading(true);

try {
 const provider = createBaseAccountSDK.getProvider;

 // Generate nonce
 const nonce = window.crypto.randomUUID.replace(/-/g, '');

 // Authenticate with Base Account
 const { accounts } = await provider.request({
method: 'wallet_connect',
params: [{
 version: '1',
 capabilities: {
signInWithEthereum: {
 nonce,
 chainId: '0x2105'
}
 }
}]
 });

 const { address } = accounts[0];
 const { message, signature } = accounts[0].capabilities.signInWithEthereum;

 // Verify on backend
 const response = await fetch('/auth/verify', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ address, message, signature })
 });

 if (response.ok) {
setUser({ address });
 }
} catch (error) {
 console.error('Authentication failed:', error);
} finally {
 setLoading(false);
}
 };

 return (
<div>
 {user ? (
<div>Welcome, {user.address}</div>
 ) : (
<SignInWithBaseButton
 onClick={handleSignIn}
 disabled={loading}
/>
 )}
</div>
 );
}
```## Error Handling

| Code | Message | Description |
| ------ | ------------------------- | ---------------------------------------------------- |
| 4001 | User rejected the request | User denied the authentication request |
| 4100 | Method not supported | Wallet doesn't support signInWithEthereum capability |
| -32602 | Invalid params | Invalid nonce or chainId provided |


> Warning:
The`signInWithEthereum`capability only works with the`wallet_connect`method. Using it with other methods like`eth_requestAccounts`will not work.

<Info>
 Base Account signatures include ERC-6492 wrapper for undeployed smart wallets, which viem's`verifyMessage` handles automatically.
</Info>

## Best Practices

1. **Fresh Nonces**: Always generate unique nonces for each authentication attempt
2. **Secure Generation**: Use cryptographically secure random number generation
3. **Nonce Tracking**: Track used nonces on your backend to prevent replay attacks
4. **Signature Verification**: Always verify signatures on your backend, never trust client-side verification
5. **Session Management**: Create secure sessions or JWT tokens after successful verification

<BaseBanner
 id="privacy-policy"
 dismissable={false}
 content={({ onDismiss }) => (
 <div className="flex items-center">
 <div className="mr-2">
 We're updating the Base Privacy Policy, effective July 25, 2025, to reflect an expansion of Base services. Please review the updated policy here:{" "}
 <a
 href="https://docs.base.org/privacy-policy-2025
 target="_blank"
 className="whitespace-nowrap"
 >
 Base Privacy Policy
 </a>. By continuing to use Base services, you confirm that you have read and understand the updated policy.
 </div>
 <Button onClick={onDismiss}>I Acknowledge</Button>
 </div>
)}
/>


# atomic

> Ensures batched transactions are executed atomically and contiguously

export const Button = ({children, disabled, variant = "primary", size = "medium", iconName, roundedFull = false, className = '', fullWidth = false, onClick = undefined}) => {
 const variantStyles = {
 primary: 'bg-blue text-black border border-blue hover:bg-blue-80 active:bg-[#06318E] dark:text-white',
 secondary: 'bg-white border border-white text-palette-foreground hover:bg-zinc-15 active:bg-zinc-30',
 outlined: 'bg-transparent text-white border border-white hover:bg-white hover:text-black active:bg-[#E3E7E9]'
 };
 const sizeStyles = {
 medium: 'text-md px-4 py-2 gap-3',
 large: 'text-lg px-6 py-4 gap-5'
 };
 const sizeIconRatio = {
 medium: '0.75rem',
 large: '1rem'
 };
 const classes = ['text-md px-4 py-2 whitespace-nowrap', 'flex items-center justify-center', 'disabled:opacity-40 disabled:pointer-events-none', 'transition-all', variantStyles[variant], sizeStyles[size], roundedFull ? 'rounded-full' : 'rounded-lg', fullWidth ? 'w-full' : 'w-auto', className];
 const buttonClasses = classes.filter(Boolean).join(' ');
 const iconSize = sizeIconRatio[size];
 return <button type="button" disabled={disabled} className={buttonClasses} onClick={onClick}>
 <span>{children}</span>
 {iconName && <Icon name={iconName} width={iconSize} height={iconSize} color="currentColor" />}
 </button>;
};

export const BaseBanner = ({content = null, id, dismissable = true}) => {
 const LOCAL_STORAGE_KEY_PREFIX = 'cb-docs-banner';
 const [isVisible, setIsVisible] = useState(false);
 const onDismiss = => {
 localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}-${id}`, 'false');
 setIsVisible(false);
 };
 useEffect( => {
 const storedValue = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}-${id}`);
 setIsVisible(storedValue !== 'false');
 }, []);
 if (!isVisible) {
 return null;
 }
 return <div className="fixed bottom-0 left-0 right-0 bg-white py-8 px-4 lg:px-12 z-50 text-black dark:bg-black dark:text-white border-t dark:border-gray-95">
 <div className="flex items-center max-w-8xl mx-auto">
 {typeof content === 'function' ? content({
 onDismiss
 }) : content}
 {dismissable && <button onClick={onDismiss} className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" aria-label="Dismiss banner">
 ✕
 </button>}
 </div>
 </div>;
};

Defined in [EIP-5792](https://eips.ethereum.org/EIPS/eip-5792)

<Info>
 The atomic capability specifies how wallets execute batches of transactions, providing guarantees for atomic transaction execution. When supported, all transactions in a batch must succeed together or fail together.
</Info>

## Parameters

<ParamField body="supported" type="string" required>
 The atomic capability status for the current chain and account.

 **Possible values:**

 * `"supported"`: Wallet will execute all calls atomically and contiguously
 * `"ready"`: Wallet can upgrade to atomic execution pending user approval
 * `"unsupported"`: No atomicity or contiguity guarantees
</ParamField>

## Returns

<ResponseField name="atomic" type="object">
 The atomic capability configuration for the specified chain.

 <Expandable title="Atomic capability properties">
 <ResponseField name="supported" type="string">
 Indicates the level of atomic execution support available.
 </ResponseField>
 </Expandable>
</ResponseField>

## Example Usage

<RequestExample>
#### Code
```typescript
 const capabilities = await provider.request({
method: 'wallet_getCapabilities',
params: ['0xd46e8dd67c5d32be8058bb8eb970870f07244567']
 });

 console.log(capabilities["0x2105"].atomic);
```#### Code```typescript
 const result = await provider.request({
method: "wallet_sendCalls",
params: [{
 version: "1.0",
 chainId: "0x2105",
 from: "0xd46e8dd67c5d32be8058bb8eb970870f07244567",
 atomicRequired: true,
 calls: [
{
 to: "0x1234567890123456789012345678901234567890",
 value: "0x0",
 data: "0xa9059cbb000000000000000000000000..."
}
 ]
}]
 });
```</RequestExample>

<ResponseExample>
#### JSON```json
 {
"0x2105": {
 "atomic": {
"supported": "supported"
 }
}
 }
```#### JSON```json
 {
"0x2105": {
 "atomic": {
"supported": "ready"
 }
}
 }
```#### JSON```json
 {
"0x2105": {
 "atomic": {
"supported": "unsupported"
 }
}
 }
```</ResponseExample>

## Error Handling

| Code | Message | Description |
| ---- | ------------------------------ | ------------------------------------------------------------------- |
| 4100 | Atomic execution not supported | Wallet does not support atomic transaction execution |
| 5700 | Atomic capability required | Transaction requires atomic execution but wallet doesn't support it |
| 5750 | Atomic upgrade rejected | User rejected the upgrade to atomic execution capability |

## Use Cases

### DeFi Operations

Atomic execution is crucial for DeFi operations where multiple steps must complete together:
#### Code```typescript
// Swap tokens atomically
const swapCalls = await provider.request({
 method: "wallet_sendCalls",
 params: [{
version: "1.0",
chainId: "0x2105",
from: userAddress,
atomicRequired: true,
calls: [
 // 1. Approve token spend
 {
to: tokenAddress,
value: "0x0",
data: approveCallData
 },
 // 2. Execute swap
 {
to: swapContractAddress,
value: "0x0",
data: swapCallData
 },
 // 3. Claim rewards (if applicable)
 {
to: rewardsContractAddress,
value: "0x0",
data: claimCallData
 }
]
 }]
});
```### NFT Minting with Payment
#### Code```typescript
// Mint NFT and pay fees atomically
const mintCalls = await provider.request({
 method: "wallet_sendCalls",
 params: [{
version: "1.0",
chainId: "0x2105",
from: userAddress,
atomicRequired: true,
calls: [
 // 1. Pay minting fee
 {
to: paymentAddress,
value: "0x16345785d8a0000", // 0.1 ETH
data: "0x"
 },
 // 2. Mint NFT
 {
to: nftContractAddress,
value: "0x0",
data: mintCallData
 }
]
 }]
});
```## Error Handling

Handle atomic capability errors appropriately:
#### Code```typescript
async function executeAtomicTransaction(calls) {
 try {
// Check atomic capability first
const capabilities = await provider.request({
 method: 'wallet_getCapabilities',
 params: [userAddress]
});

const atomicCapability = capabilities["0x2105"]?.atomic;

if (!atomicCapability || atomicCapability === "unsupported") {
 throw new Error("Atomic execution not supported");
}

// Execute atomic transaction
const result = await provider.request({
 method: "wallet_sendCalls",
 params: [{
version: "1.0",
chainId: "0x2105",
from: userAddress,
atomicRequired: true,
calls
 }]
});

return result;

 } catch (error) {
if (error.code === 4100) {
 console.error("Atomic execution not supported by wallet");
 // Fallback to sequential execution
 return executeSequentialTransaction(calls);
} else {
 console.error("Atomic transaction failed:", error);
 throw error;
}
 }
}
```## Relationship with EIP-7702

The atomic capability works with EIP-7702 to enable EOA (Externally Owned Accounts) to upgrade to smart accounts that support atomic transaction execution:
#### Code```typescript
// Check if wallet can upgrade to atomic execution
const capabilities = await provider.request({
 method: 'wallet_getCapabilities',
 params: [eoaAddress]
});

if (capabilities["0x2105"].atomic === "ready") {
 console.log("Wallet can upgrade to support atomic execution with user approval");
}
```## Best Practices

1. **Check Capabilities First**: Always verify atomic support before requiring it
2. **Provide Fallbacks**: Implement sequential execution as a fallback when atomic isn't available
3. **Use for Related Operations**: Only require atomicity for operations that must succeed together
4. **Clear Error Messages**: Provide helpful error messages when atomic execution fails


> Warning:
The atomic capability is chain-specific. Always check support for the specific chain you're targeting.

<Info>
 Apps should first check wallet capabilities using`wallet_getCapabilities` before sending requests requiring atomic execution.
</Info>

<BaseBanner
 id="privacy-policy"
 dismissable={false}
 content={({ onDismiss }) => (
 <div className="flex items-center">
 <div className="mr-2">
 We're updating the Base Privacy Policy, effective July 25, 2025, to reflect an expansion of Base services. Please review the updated policy here:{" "}
 <a
 href="https://docs.base.org/privacy-policy-2025
 target="_blank"
 className="whitespace-nowrap"
 >
 Base Privacy Policy
 </a>. By continuing to use Base services, you confirm that you have read and understand the updated policy.
 </div>
 <Button onClick={onDismiss}>I Acknowledge</Button>
 </div>
)}
/>


# flowControl

> Control transaction batch behavior after failed or reverted calls

export const Button = ({children, disabled, variant = "primary", size = "medium", iconName, roundedFull = false, className = '', fullWidth = false, onClick = undefined}) => {
 const variantStyles = {
 primary: 'bg-blue text-black border border-blue hover:bg-blue-80 active:bg-[#06318E] dark:text-white',
 secondary: 'bg-white border border-white text-palette-foreground hover:bg-zinc-15 active:bg-zinc-30',
 outlined: 'bg-transparent text-white border border-white hover:bg-white hover:text-black active:bg-[#E3E7E9]'
 };
 const sizeStyles = {
 medium: 'text-md px-4 py-2 gap-3',
 large: 'text-lg px-6 py-4 gap-5'
 };
 const sizeIconRatio = {
 medium: '0.75rem',
 large: '1rem'
 };
 const classes = ['text-md px-4 py-2 whitespace-nowrap', 'flex items-center justify-center', 'disabled:opacity-40 disabled:pointer-events-none', 'transition-all', variantStyles[variant], sizeStyles[size], roundedFull ? 'rounded-full' : 'rounded-lg', fullWidth ? 'w-full' : 'w-auto', className];
 const buttonClasses = classes.filter(Boolean).join(' ');
 const iconSize = sizeIconRatio[size];
 return <button type="button" disabled={disabled} className={buttonClasses} onClick={onClick}>
 <span>{children}</span>
 {iconName && <Icon name={iconName} width={iconSize} height={iconSize} color="currentColor" />}
 </button>;
};

export const BaseBanner = ({content = null, id, dismissable = true}) => {
 const LOCAL_STORAGE_KEY_PREFIX = 'cb-docs-banner';
 const [isVisible, setIsVisible] = useState(false);
 const onDismiss = => {
 localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}-${id}`, 'false');
 setIsVisible(false);
 };
 useEffect( => {
 const storedValue = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}-${id}`);
 setIsVisible(storedValue !== 'false');
 }, []);
 if (!isVisible) {
 return null;
 }
 return <div className="fixed bottom-0 left-0 right-0 bg-white py-8 px-4 lg:px-12 z-50 text-black dark:bg-black dark:text-white border-t dark:border-gray-95">
 <div className="flex items-center max-w-8xl mx-auto">
 {typeof content === 'function' ? content({
 onDismiss
 }) : content}
 {dismissable && <button onClick={onDismiss} className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" aria-label="Dismiss banner">
 ✕
 </button>}
 </div>
 </div>;
};

Defined in [ERC-7867](https://github.com/ethereum/ERCs/pulls/) (Proposed)

<Info>
 The flowControl capability allows dapps to specify how transaction batches should behave when individual calls fail or revert. This provides fine-grained control over transaction execution flow and enables more sophisticated error handling strategies.
</Info>


> Warning:
This capability is currently proposed in ERC-7867 and is not yet finalized. Implementation details may change as the specification develops.

## Parameters

<ParamField body="onFailure" type="string">
 Specifies the behavior when a transaction call fails or reverts.

 **Possible values:**

 * `"continue"`: Continue executing remaining calls
 * `"stop"`: Stop execution on failure
 * `"retry"`: Attempt to retry the failed call
</ParamField>

<ParamField body="fallbackCall" type="object">
 Optional fallback transaction to execute if the primary call fails.

 <Expandable title="FallbackCall properties">
 <ParamField body="to" type="string" required>
 The recipient address for the fallback call.
 </ParamField>

 <ParamField body="value" type="string">
 The value to send with the fallback call (in wei, hex format).
 </ParamField>

 <ParamField body="data" type="string">
 The call data for the fallback call (hex format).
 </ParamField>
 </Expandable>
</ParamField>

## Returns

<ResponseField name="flowControl" type="object">
 The flow control capability configuration for the specified chain.

 <Expandable title="FlowControl capability properties">
 <ResponseField name="supported" type="boolean">
 Indicates whether the wallet supports flow control functionality.
 </ResponseField>
 </Expandable>
</ResponseField>

## Example Usage

<RequestExample>
#### Code
```typescript
 const capabilities = await provider.request({
method: 'wallet_getCapabilities',
params: [userAddress]
 });

 const flowControlCapability = capabilities["0x2105"]?.flowControl;
```#### Code```typescript
 const result = await provider.request({
method: 'wallet_sendCalls',
params: [{
 version: "1.0",
 chainId: "0x2105",
 from: userAddress,
 calls: [
{
 to: "0x1234567890123456789012345678901234567890",
 value: "0x0",
 data: "0xa9059cbb000000000000000000000000...",
 flowControl: {
onFailure: "continue",
fallbackCall: {
 to: "0x...",
 data: "0x..."
}
 }
}
 ]
}]
 });
```</RequestExample>

<ResponseExample>
#### JSON```json
 {
"0x2105": {
 "flowControl": {
"supported": true
 }
}
 }
```#### JSON```json
 {
"0x2105": {
 "flowControl": {
"supported": false
 }
}
 }
```</ResponseExample>

## Error Handling

| Code | Message | Description |
| ---- | -------------------------------- | --------------------------------------------------------------- |
| 4100 | Flow control not supported | Wallet does not support flow control functionality |
| 5700 | Flow control capability required | Transaction requires flow control but wallet doesn't support it |
| 5800 | Invalid flow control parameters | The provided flow control configuration is invalid |

## Potential Use Cases

### E-commerce Transactions

Handle scenarios where some purchases succeed while others fail:
#### Code```typescript
// Example: Multi-item purchase with flow control
const purchaseResult = await provider.request({
 method: 'wallet_sendCalls',
 params: [{
version: "1.0",
chainId: "0x2105",
from: userAddress,
calls: [
 // Primary item purchase
 {
to: marketplaceContract,
value: "0x0",
data: purchaseItem1CallData,
flowControl: { onFailure: "continue" }
 },
 // Secondary item purchase
 {
to: marketplaceContract,
value: "0x0",
data: purchaseItem2CallData,
flowControl: { onFailure: "continue" }
 },
 // Payment processing (critical)
 {
to: paymentContract,
value: "0x16345785d8a0000",
data: "0x",
flowControl: { onFailure: "stop" }
 }
]
 }]
});
```### DeFi Operations with Fallbacks

Implement sophisticated DeFi strategies with backup options:
#### Code```typescript
// Example: Swap with fallback routing
const swapWithFallback = await provider.request({
 method: 'wallet_sendCalls',
 params: [{
version: "1.0",
chainId: "0x2105",
from: userAddress,
calls: [
 // Primary DEX swap
 {
to: primaryDexAddress,
value: "0x0",
data: primarySwapCallData,
flowControl: {
 onFailure: "fallback",
 fallbackCall: {
to: secondaryDexAddress,
data: secondarySwapCallData
 }
}
 }
]
 }]
});
```### Batch Operations with Error Recovery

Execute batch operations that can gracefully handle individual failures:
#### Code```typescript
// Example: Bulk token approvals with recovery
const bulkApprovals = await provider.request({
 method: 'wallet_sendCalls',
 params: [{
version: "1.0",
chainId: "0x2105",
from: userAddress,
calls: tokenAddresses.map((token, index) => ({
 to: token,
 value: "0x0",
 data: approveCallData,
 flowControl: {
onFailure: "continue", // Don't stop batch if one approval fails
retryCount: 2 // Retry failed approvals
 }
}))
 }]
});
```## Checking Capability Support

Once implemented, check for flow control support:
#### Code```typescript
async function checkFlowControlSupport {
 try {
const capabilities = await provider.request({
 method: 'wallet_getCapabilities',
 params: [userAddress]
});

const flowControlCapability = capabilities["0x2105"]?.flowControl;

if (flowControlCapability?.supported) {
 console.log("Flow control capability supported");
 return true;
} else {
 console.log("Flow control capability not supported");
 return false;
}
 } catch (error) {
console.error("Error checking flow control capability:", error);
return false;
 }
}
````

## Expected Benefits

When implemented, flow control will provide:

1. **Better User Experience**: Partial success instead of complete failure
2. **Flexible Error Handling**: Apps can define custom failure responses
3. **Reduced Gas Waste**: Avoid re-executing successful operations
4. **Complex Workflows**: Enable sophisticated multi-step processes

## Development Status

This capability is actively being developed:

- **ERC-7867**: Formal proposal for flow control capability
- **Community Input**: Ongoing discussions about implementation details
- **Wallet Integration**: Pending finalization of specification

## Preparing for Flow Control

While waiting for implementation, developers can:

1. **Design Flexible Architecture**: Build apps that can adapt to different execution models
2. **Implement Fallback Logic**: Create manual fallback strategies for critical operations
3. **Monitor Specification**: Track ERC-7867 progress for implementation updates
4. **Test Sequential Execution**: Use current capabilities to simulate flow control behavior

<Info>
 Stay updated on ERC-7867 development to implement flow control as soon as it's available in production wallets.
</Info>

> Warning:
> The examples above are conceptual and may not reflect the final implementation. Always refer to the latest ERC-7867 specification for accurate details.

## Related Capabilities

Flow control works alongside other capabilities:

- **[Atomic](/base-account/reference/core/capabilities/atomic)**: For strict all-or-nothing execution
- **[Paymaster Service](/base-account/reference/core/capabilities/paymasterService)**: For sponsored transaction flows
- **[Auxiliary Funds](/base-account/reference/core/capabilities/auxiliaryFunds)**: For flexible funding sources

<BaseBanner
id="privacy-policy"
dismissable={false}
content={({ onDismiss }) => (

 <div className="flex items-center">
 <div className="mr-2">
 We're updating the Base Privacy Policy, effective July 25, 2025, to reflect an expansion of Base services. Please review the updated policy here:{" "}
 <a
 href="https://docs.base.org/privacy-policy-2025
 target="_blank"
 className="whitespace-nowrap"
 >
 Base Privacy Policy
 </a>. By continuing to use Base services, you confirm that you have read and understand the updated policy.
 </div>
 <Button onClick={onDismiss}>I Acknowledge</Button>
 </div>
)}
/>

# paymasterService

> Enable sponsored transactions using ERC-4337 paymaster web services

export const Button = ({children, disabled, variant = "primary", size = "medium", iconName, roundedFull = false, className = '', fullWidth = false, onClick = undefined}) => {
const variantStyles = {
primary: 'bg-blue text-black border border-blue hover:bg-blue-80 active:bg-[#06318E] dark:text-white',
secondary: 'bg-white border border-white text-palette-foreground hover:bg-zinc-15 active:bg-zinc-30',
outlined: 'bg-transparent text-white border border-white hover:bg-white hover:text-black active:bg-[#E3E7E9]'
};
const sizeStyles = {
medium: 'text-md px-4 py-2 gap-3',
large: 'text-lg px-6 py-4 gap-5'
};
const sizeIconRatio = {
medium: '0.75rem',
large: '1rem'
};
const classes = ['text-md px-4 py-2 whitespace-nowrap', 'flex items-center justify-center', 'disabled:opacity-40 disabled:pointer-events-none', 'transition-all', variantStyles[variant], sizeStyles[size], roundedFull ? 'rounded-full' : 'rounded-lg', fullWidth ? 'w-full' : 'w-auto', className];
const buttonClasses = classes.filter(Boolean).join(' ');
const iconSize = sizeIconRatio[size];
return <button type="button" disabled={disabled} className={buttonClasses} onClick={onClick}>
<span>{children}</span>
{iconName && <Icon name={iconName} width={iconSize} height={iconSize} color="currentColor" />}
</button>;
};

export const BaseBanner = ({content = null, id, dismissable = true}) => {
const LOCAL_STORAGE_KEY_PREFIX = 'cb-docs-banner';
const [isVisible, setIsVisible] = useState(false);
const onDismiss = => {
localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}-${id}`, 'false');
setIsVisible(false);
};
useEffect( => {
const storedValue = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}-${id}`);
setIsVisible(storedValue !== 'false');
}, []);
if (!isVisible) {
return null;
}
return <div className="fixed bottom-0 left-0 right-0 bg-white py-8 px-4 lg:px-12 z-50 text-black dark:bg-black dark:text-white border-t dark:border-gray-95">

 <div className="flex items-center max-w-8xl mx-auto">
 {typeof content === 'function' ? content({
 onDismiss
 }) : content}
 {dismissable && <button onClick={onDismiss} className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" aria-label="Dismiss banner">
 ✕
 </button>}
 </div>
 </div>;
};

Defined in [ERC-7677](https://eips.ethereum.org/EIPS/eip-7677)

<Info>
 The paymasterService capability enables apps to sponsor user transactions using ERC-4337 paymaster web services. This allows users to execute transactions without paying gas fees directly.
</Info>

> Warning:
> This capability is not yet finalized and may change in future iterations.

## Parameters

<ParamField body="url" type="string" required>
 The URL of the ERC-7677-compliant paymaster service that will sponsor the transactions.

**Format:** Must be a valid HTTPS URL pointing to a paymaster service endpoint.
</ParamField>

## Returns

<ResponseField name="paymasterService" type="object">
 The paymaster service capability configuration for the specified chain.

 <Expandable title="PaymasterService capability properties">
 <ResponseField name="supported" type="boolean">
 Indicates whether the wallet supports paymaster service integration.
 </ResponseField>
 </Expandable>
</ResponseField>

## Example Usage

<RequestExample>
#### Code
```typescript
 const capabilities = await provider.request({
method: 'wallet_getCapabilities',
params: [userAddress]
 });

const paymasterSupport = capabilities["0x2105"]?.paymasterService;
`#### Code`typescript
const result = await provider.request({
method: 'wallet_sendCalls',
params: [{
version: "1.0",
chainId: "0x2105",
from: userAddress,
calls: [{
to: "0x1234567890123456789012345678901234567890",
value: "0x0",
data: "0xa9059cbb000000000000000000000000..."
}],
capabilities: {
paymasterService: {
url: "https://your-paymaster-service.xyz
}
}
}]
});

````</RequestExample>

<ResponseExample>
#### JSON```json
 {
"0x2105": {
 "paymasterService": {
"supported": true
 }
}
 }
```#### JSON```json
 {
"0x2105": {
 "paymasterService": {
"supported": false
 }
}
 }
```</ResponseExample>

## Error Handling

| Code | Message | Description |
| ---- | ------------------------------- | -------------------------------------------------------------------- |
| 4100 | Paymaster service not supported | Wallet does not support paymaster service integration |
| 4200 | Invalid paymaster URL | The provided paymaster service URL is invalid or unreachable |
| 4300 | Paymaster service error | The paymaster service returned an error or is unavailable |
| 5700 | Paymaster capability required | Transaction requires paymaster service but wallet doesn't support it |

## Paymaster Service Implementation

The paymaster service must implement ERC-7677 compliance with these endpoints:

### 1. Gas Estimation Endpoint
#### Code```typescript
// pm_getPaymasterStubData
POST /rpc
{
 "jsonrpc": "2.0",
 "id": 1,
 "method": "pm_getPaymasterStubData",
 "params": [
userOp, // User operation object
entryPoint, // Entry point address
chainId, // Chain ID
context // Additional context
 ]
}
```### 2. Paymaster Data Endpoint
#### Code```typescript
// pm_getPaymasterData
POST /rpc
{
 "jsonrpc": "2.0",
 "id": 1,
 "method": "pm_getPaymasterData",
 "params": [
userOp, // User operation object
entryPoint, // Entry point address
chainId, // Chain ID
context // Additional context
 ]
}
```## Complete Example

Here's a complete example of implementing sponsored transactions:
#### Code```typescript
class SponsoredTransactionManager {
 private paymasterUrl = "https://api.example.com/paymaster;

 async executeSponsored(calls: any[]) {
try {
 // 1. Check paymaster capability
 const capabilities = await provider.request({
method: 'wallet_getCapabilities',
params: [userAddress]
 });

 if (!capabilities["0x2105"]?.paymasterService?.supported) {
throw new Error("Paymaster services not supported");
 }

 // 2. Execute sponsored transaction
 const result = await provider.request({
method: 'wallet_sendCalls',
params: [{
 version: "1.0",
 chainId: "0x2105",
 from: userAddress,
 calls,
 capabilities: {
paymasterService: {
 url: this.paymasterUrl
}
 }
}]
 });

 console.log("Sponsored transaction submitted:", result);
 return result;

} catch (error) {
 console.error("Sponsored transaction failed:", error);
 throw error;
}
 }

 // Example: Sponsored token transfer
 async sponsoredTransfer(token: string, to: string, amount: string) {
const calls = [{
 to: token,
 value: "0x0",
 data: this.encodeTransfer(to, amount)
}];

return this.executeSponsored(calls);
 }

 private encodeTransfer(to: string, amount: string): string {
// Encode ERC-20 transfer function call
// This is a simplified example
return `0xa9059cbb${to.slice(2).padStart(64, '0')}${BigInt(amount).toString(16).padStart(64, '0')}`;
 }
}

// Usage
const sponsoredTx = new SponsoredTransactionManager;

// Execute sponsored token transfer
await sponsoredTx.sponsoredTransfer(
 "0xA0b86a33E6441b8a2f0d2d2a71Cba0F42c4B1D2E", // USDC token
 "0x742d35Cc4Bf53E0e6C42E5d9F0A8D2F6D8A8B7C9", // recipient
 "1000000" // 1 USDC (6 decimals)
);
```## Error Handling

Handle paymaster-related errors appropriately:
#### Code```typescript
async function executeWithPaymaster(calls: any[]) {
 try {
const result = await provider.request({
 method: 'wallet_sendCalls',
 params: [{
version: "1.0",
chainId: "0x2105",
from: userAddress,
calls,
capabilities: {
 paymasterService: {
url: "https://paymaster.example.com
 }
}
 }]
});

return result;

 } catch (error) {
if (error.code === 4100) {
 console.error("Paymaster service not supported");
 // Fallback to regular transaction
 return executeRegularTransaction(calls);
} else if (error.message.includes("paymaster")) {
 console.error("Paymaster service error:", error);
 // Handle paymaster-specific errors
 throw new Error("Transaction sponsorship failed");
} else {
 console.error("Transaction failed:", error);
 throw error;
}
 }
}
```## Use Cases

### Gaming Applications
#### Code```typescript
// Sponsor in-game item purchases
const gameItemPurchase = await provider.request({
 method: 'wallet_sendCalls',
 params: [{
version: "1.0",
chainId: "0x2105",
from: playerAddress,
calls: [{
 to: gameContractAddress,
 value: "0x0",
 data: purchaseItemCallData
}],
capabilities: {
 paymasterService: {
url: "https://game-paymaster.example.com
 }
}
 }]
});
```### DeFi Onboarding
#### Code```typescript
// Sponsor first-time user transactions
const onboardingTx = await provider.request({
 method: 'wallet_sendCalls',
 params: [{
version: "1.0",
chainId: "0x2105",
from: newUserAddress,
calls: [
 // Stake tokens
 {
to: stakingContract,
value: "0x0",
data: stakeCallData
 }
],
capabilities: {
 paymasterService: {
url: "https://defi-onboarding-paymaster.example.com
 }
}
 }]
});
````

## Best Practices

1. **Validate Paymaster URLs**: Ensure paymaster service URLs are trustworthy and ERC-7677 compliant
2. **Handle Failures Gracefully**: Implement fallbacks for when paymaster services are unavailable
3. **Monitor Costs**: Track paymaster usage to manage sponsorship costs
4. **User Communication**: Clearly communicate when transactions are sponsored

<Info>
 The paymaster service capability enables seamless user experiences by removing the need for users to hold native tokens for gas fees.
</Info>

<BaseBanner
id="privacy-policy"
dismissable={false}
content={({ onDismiss }) => (

 <div className="flex items-center">
 <div className="mr-2">
 We're updating the Base Privacy Policy, effective July 25, 2025, to reflect an expansion of Base services. Please review the updated policy here:{" "}
 <a
 href="https://docs.base.org/privacy-policy-2025
 target="_blank"
 className="whitespace-nowrap"
 >
 Base Privacy Policy
 </a>. By continuing to use Base services, you confirm that you have read and understand the updated policy.
 </div>
 <Button onClick={onDismiss}>I Acknowledge</Button>
 </div>
)}
/>

# auxiliaryFunds

> Indicates wallet access to funds beyond on-chain balance verification

export const Button = ({children, disabled, variant = "primary", size = "medium", iconName, roundedFull = false, className = '', fullWidth = false, onClick = undefined}) => {
const variantStyles = {
primary: 'bg-blue text-black border border-blue hover:bg-blue-80 active:bg-[#06318E] dark:text-white',
secondary: 'bg-white border border-white text-palette-foreground hover:bg-zinc-15 active:bg-zinc-30',
outlined: 'bg-transparent text-white border border-white hover:bg-white hover:text-black active:bg-[#E3E7E9]'
};
const sizeStyles = {
medium: 'text-md px-4 py-2 gap-3',
large: 'text-lg px-6 py-4 gap-5'
};
const sizeIconRatio = {
medium: '0.75rem',
large: '1rem'
};
const classes = ['text-md px-4 py-2 whitespace-nowrap', 'flex items-center justify-center', 'disabled:opacity-40 disabled:pointer-events-none', 'transition-all', variantStyles[variant], sizeStyles[size], roundedFull ? 'rounded-full' : 'rounded-lg', fullWidth ? 'w-full' : 'w-auto', className];
const buttonClasses = classes.filter(Boolean).join(' ');
const iconSize = sizeIconRatio[size];
return <button type="button" disabled={disabled} className={buttonClasses} onClick={onClick}>
<span>{children}</span>
{iconName && <Icon name={iconName} width={iconSize} height={iconSize} color="currentColor" />}
</button>;
};

export const BaseBanner = ({content = null, id, dismissable = true}) => {
const LOCAL_STORAGE_KEY_PREFIX = 'cb-docs-banner';
const [isVisible, setIsVisible] = useState(false);
const onDismiss = => {
localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}-${id}`, 'false');
setIsVisible(false);
};
useEffect( => {
const storedValue = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}-${id}`);
setIsVisible(storedValue !== 'false');
}, []);
if (!isVisible) {
return null;
}
return <div className="fixed bottom-0 left-0 right-0 bg-white py-8 px-4 lg:px-12 z-50 text-black dark:bg-black dark:text-white border-t dark:border-gray-95">

 <div className="flex items-center max-w-8xl mx-auto">
 {typeof content === 'function' ? content({
 onDismiss
 }) : content}
 {dismissable && <button onClick={onDismiss} className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" aria-label="Dismiss banner">
 ✕
 </button>}
 </div>
 </div>;
};

Defined in [EIP-5792](https://eips.ethereum.org/EIPS/eip-5792)

<Info>
 The auxiliaryFunds capability allows wallets to indicate they have access to funds beyond what can be directly verified on-chain by the wallet's address. This enables more flexible transaction execution and improved user experiences.
</Info>

> Warning:
> This capability is not yet finalized and may change in future iterations.

## Parameters

This capability has no configuration parameters. It is either supported or not supported by the wallet.

## Returns

<ResponseField name="auxiliaryFunds" type="object">
 The auxiliary funds capability configuration for the specified chain.

 <Expandable title="AuxiliaryFunds capability properties">
 <ResponseField name="supported" type="boolean">
 Indicates whether the wallet has access to auxiliary funding sources beyond on-chain balance.
 </ResponseField>
 </Expandable>
</ResponseField>

## Example Usage

<RequestExample>
#### Code
```typescript
 const capabilities = await provider.request({
method: 'wallet_getCapabilities',
params: [userAddress]
 });

const auxiliaryFunds = capabilities["0x2105"]?.auxiliaryFunds;
`#### Code`typescript
if (auxiliaryFunds?.supported) {
// Don't block transactions based on visible balance alone
console.log("Wallet has access to auxiliary funds");
} else {
// Check on-chain balance before allowing transactions
const balance = await provider.request({
method: 'eth_getBalance',
params: [userAddress, 'latest']
});
}

````</RequestExample>

<ResponseExample>
#### JSON```json
 {
"0x2105": {
 "auxiliaryFunds": {
"supported": true
 }
}
 }
```#### JSON```json
 {
"0x2105": {
 "auxiliaryFunds": {
"supported": false
 }
}
 }
```</ResponseExample>

## Error Handling

| Code | Message | Description |
| ---- | ----------------------------- | -------------------------------------------------------------- |
| 4100 | Auxiliary funds not supported | Wallet does not support auxiliary funding sources |
| 4200 | Auxiliary funds unavailable | Auxiliary funding sources are temporarily unavailable |
| 4300 | Insufficient auxiliary funds | Auxiliary funds exist but are insufficient for the transaction |

## Wallet Implementation

Wallets supporting auxiliary funds must include the capability in their response:
#### Code```typescript
// Wallet response to wallet_getCapabilities
{
 "0x2105": { // Base mainnet
"auxiliaryFunds": {
 "supported": true
}
 }
}
```## App Behavior

Apps should modify their balance checking logic when auxiliary funds are supported:

### Without Auxiliary Funds
#### Code```typescript
async function checkCanExecuteTransaction(amount: bigint) {
 const balance = await provider.request({
method: 'eth_getBalance',
params: [userAddress, 'latest']
 });

 if (BigInt(balance) < amount) {
throw new Error("Insufficient balance");
 }

 return true;
}
```### With Auxiliary Funds Support
#### Code```typescript
async function checkCanExecuteTransaction(amount: bigint) {
 const capabilities = await provider.request({
method: 'wallet_getCapabilities',
params: [userAddress]
 });

 if (capabilities["0x2105"]?.auxiliaryFunds?.supported) {
// Wallet may have auxiliary funds, allow transaction
console.log("Auxiliary funds available, proceeding with transaction");
return true;
 }

 // Check on-chain balance as fallback
 const balance = await provider.request({
method: 'eth_getBalance',
params: [userAddress, 'latest']
 });

 if (BigInt(balance) < amount) {
throw new Error("Insufficient balance");
 }

 return true;
}
```## Use Cases

### DeFi Applications

Enable DeFi operations even when wallet balance appears insufficient:
#### Code```typescript
class DeFiManager {
 async executeSwap(fromToken: string, toToken: string, amount: string) {
const capabilities = await provider.request({
 method: 'wallet_getCapabilities',
 params: [userAddress]
});

const hasAuxiliaryFunds = capabilities["0x2105"]?.auxiliaryFunds?.supported;

if (!hasAuxiliaryFunds) {
 // Check token balance for non-auxiliary wallets
 const tokenBalance = await this.getTokenBalance(fromToken, userAddress);
 if (BigInt(tokenBalance) < BigInt(amount)) {
throw new Error("Insufficient token balance");
 }
}

// Proceed with swap
return provider.request({
 method: 'wallet_sendCalls',
 params: [{
version: "1.0",
chainId: "0x2105",
from: userAddress,
calls: [{
 to: swapContractAddress,
 value: "0x0",
 data: this.encodeSwap(fromToken, toToken, amount)
}]
 }]
});
 }

 private async getTokenBalance(token: string, account: string): Promise<string> {
// Implementation to check ERC-20 token balance
return "0";
 }

 private encodeSwap(from: string, to: string, amount: string): string {
// Implementation to encode swap call data
return "0x";
 }
}
```### E-commerce Applications

Allow purchases without blocking on visible balance:
#### Code```typescript
class PaymentProcessor {
 async processPurchase(amount: bigint, currency: string) {
const capabilities = await provider.request({
 method: 'wallet_getCapabilities',
 params: [userAddress]
});

if (capabilities["0x2105"]?.auxiliaryFunds?.supported) {
 // Wallet may access funds through auxiliary sources
 console.log("Processing payment with auxiliary funds support");

 return this.executePurchase(amount, currency);
} else {
 // Check sufficient balance for regular wallets
 const balance = await this.getCurrencyBalance(currency, userAddress);

 if (balance < amount) {
throw new Error(`Insufficient ${currency} balance`);
 }

 return this.executePurchase(amount, currency);
}
 }

 private async executePurchase(amount: bigint, currency: string) {
return provider.request({
 method: 'wallet_sendCalls',
 params: [{
version: "1.0",
chainId: "0x2105",
from: userAddress,
calls: [{
 to: paymentContractAddress,
 value: currency === "ETH" ? `0x${amount.toString(16)}`: "0x0",
 data: currency === "ETH" ? "0x" : this.encodeTokenTransfer(currency, amount)
}]
 }]
});
 }

 private async getCurrencyBalance(currency: string, account: string): Promise<bigint> {
if (currency === "ETH") {
 const balance = await provider.request({
method: 'eth_getBalance',
params: [account, 'latest']
 });
 return BigInt(balance);
} else {
 // Get ERC-20 token balance
 const balance = await this.getTokenBalance(currency, account);
 return BigInt(balance);
}
 }

 private encodeTokenTransfer(token: string, amount: bigint): string {
// Implementation to encode token transfer
return "0x";
 }

 private async getTokenBalance(token: string, account: string): Promise<string> {
// Implementation to check token balance
return "0";
 }
}```### Gaming Applications

Enable in-game purchases without balance restrictions:
#### Code```typescript
class GamePurchaseManager {
 async buyGameItem(itemId: string, price: bigint) {
const capabilities = await provider.request({
 method: 'wallet_getCapabilities',
 params: [userAddress]
});

// Don't check balance if auxiliary funds are supported
if (!capabilities["0x2105"]?.auxiliaryFunds?.supported) {
 await this.validateBalance(price);
}

return provider.request({
 method: 'wallet_sendCalls',
 params: [{
version: "1.0",
chainId: "0x2105",
from: userAddress,
calls: [{
 to: gameContractAddress,
 value: "0x0",
 data: this.encodePurchaseItem(itemId, price)
}]
 }]
});
 }

 private async validateBalance(requiredAmount: bigint) {
const balance = await provider.request({
 method: 'eth_getBalance',
 params: [userAddress, 'latest']
});

if (BigInt(balance) < requiredAmount) {
 throw new Error("Insufficient balance for purchase");
}
 }

 private encodePurchaseItem(itemId: string, price: bigint): string {
// Implementation to encode game item purchase
return "0x";
 }
}
```## Error Handling

Handle auxiliary funds-related scenarios:
#### Code```typescript
async function executeTransactionWithAuxiliarySupport(calls: any[]) {
 try {
const result = await provider.request({
 method: 'wallet_sendCalls',
 params: [{
version: "1.0",
chainId: "0x2105",
from: userAddress,
calls
 }]
});

return result;

 } catch (error) {
if (error.message.includes("insufficient funds")) {
 const capabilities = await provider.request({
method: 'wallet_getCapabilities',
params: [userAddress]
 });

 if (capabilities["0x2105"]?.auxiliaryFunds?.supported) {
console.log("Transaction failed despite auxiliary funds support");
// May indicate auxiliary funds are temporarily unavailable
throw new Error("Payment method temporarily unavailable");
 } else {
throw new Error("Insufficient balance");
 }
}

throw error;
 }
}
```## Best Practices

1. **Graceful Degradation**: Always provide fallback balance checking for non-auxiliary wallets
2. **Clear Communication**: Inform users when auxiliary funding is being used
3. **Error Handling**: Handle cases where auxiliary funds may be temporarily unavailable
4. **Security**: Don't assume auxiliary funds are always available

<Info>
 The auxiliary funds capability improves user experience by enabling transactions that might otherwise be blocked by insufficient visible balance.
</Info>


> Warning:
Apps should still implement proper error handling as auxiliary funds may not always be available or sufficient.

## Related Capabilities

Auxiliary funds works well with other capabilities:

* **[Paymaster Service](/base-account/reference/core/capabilities/paymasterService)**: For sponsored transactions
* **[Atomic](/base-account/reference/core/capabilities/atomic)**: For ensuring transaction success with auxiliary funds
* **[Flow Control](/base-account/reference/core/capabilities/flowControl)**: For handling auxiliary fund failures

<BaseBanner
 id="privacy-policy"
 dismissable={false}
 content={({ onDismiss }) => (
 <div className="flex items-center">
 <div className="mr-2">
 We're updating the Base Privacy Policy, effective July 25, 2025, to reflect an expansion of Base services. Please review the updated policy here:{" "}
 <a
 href="https://docs.base.org/privacy-policy-2025
 target="_blank"
 className="whitespace-nowrap"
 >
 Base Privacy Policy
 </a>. By continuing to use Base services, you confirm that you have read and understand the updated policy.
 </div>
 <Button onClick={onDismiss}>I Acknowledge</Button>
 </div>
)}
/>



# dataCallback

> Base Account allows you to collect personal information like email addresses, physical addresses, phone numbers, and names during transactions.

## Overview

Base Pay supports requesting user profile information during payments through the dataCallback capability. This allows you to collect personal information like email addresses, physical addresses, phone numbers, and names during transactions.

## Supported Data Types

The following data types are supported for profile requests:
#### Code```typescript
type DataCallbackType =
 | 'email' // Email address
 | 'phoneNumber' // Phone number with country code
 | 'physicalAddress' // Physical address for shipping
 | 'name' // User's full name

// Full type definitions for requests and capability

type DataCallbackRequestType = {
 optional?: boolean;
 type: DataCallbackType;
}

type DataCallbackCapability = {
 requests: DataCallbackRequestType[];
 callbackURL?: string;
}
```## Data Object Types

### Name Object
#### Code```typescript
{
 firstName: string;
 lastName: string;
}
```### Physical Address Object
#### Code```typescript
{
 address1: string;
 address2?: string;
 city: string;
 state: string;
 postalCode: string;
 country: string;
 name: {
firstName: string;
familyName: string;
 };
}
```### Phone Number Object
#### Code```typescript
{
 number: string;
 countryCode: string;
}
```## Request Format

To request profile data, include the`dataCallback` capability in your [`wallet_sendCalls`](/base-account/reference/core/provider-rpc-methods/wallet_sendCalls) request:
#### Code
```typescript
const response = await provider.request({
 method: "wallet_sendCalls",
 params: [{
version: "1.0",
chainId: numberToHex(84532), // Base Sepolia
calls: [
 // Your transaction calls here
],
capabilities: {
 dataCallback: {
requests: [
 {
type: "email",
optional: false, // Whether this field is optional
 },
 {
type: "physicalAddress",
optional: true,
 },
 // Add more requests as needed
],
callbackURL: "https://your-api.com/validate // Your validation endpoint
 },
},
 }],
});
```## Callback API

Your callback API will receive a POST request with the following structure:
#### Code```typescript
// Request body structure
{
 calls: {
to: string;
data: string;
 }[];
 chainId: string;
 capabilities: {
dataCallback: {
 requestedInfo: {
email?: string;
phoneNumber?: {
 number: string;
 country: string;
 isPrimary: boolean;
};
physicalAddress?: {
address1: string;
address2?: string;
city: string;
state: string;
postalCode: string;
countryCode: string;
name: {
 firstName: string;
 familyName: string;
 };
};
isPrimary: boolean;
name?: {
 firstName: string;
 familyName: string;
};
onchainAddress?: string;
 };
};
 };
}
```## Response Format

Your callback API must respond with one of two formats:

### 1. Success Response

Return the calls the user will end up submitting wrapped in a`request`object. They can be the same calls or new ones, but they must be present. You can change all capabilities (e.g. switching Paymaster if calls happen on a different chain) except the data callback capability, which must remain present.
#### Code```typescript
{
 request: {
calls: {
 to: string;
 data: string;
}[];
chainId: string;
capabilities: {
 dataCallback: {
// Original or updated dataCallback capability
 };
 // Other capabilities can be changed as needed
};
 }
}
```### 2. Error Response

Return validation errors to prompt the user to correct their information:
#### Code```typescript
{
 errors: {
email?: string;
phoneNumber?: {
 number?: string;
 country?: string;
};
physicalAddress?: {
 address1?: string;
 address2?: string;
 city?: string;
 state?: string;
 postalCode?: string;
 countryCode?: string;
 name?: {
firstName?: string;
familyName?: string;
 };
};
name?: {
 firstName?: string;
 familyName?: string;
};
onchainAddress?: string;
 };
}
```## Example Implementation

Here's a complete example of a validation API endpoint:
#### Code```typescript
export async function POST(request: Request) {
 const requestData = await request.json;

 try {
const { requestedInfo } = requestData.capabilities.dataCallback;
const errors = {};

// Validate email
if (requestedInfo.email && requestedInfo.email.endsWith("@example.com")) {
 errors.email = "Example.com emails are not allowed";
}

// Validate physical address
if (requestedInfo.physicalAddress) {
 const addr = requestedInfo.physicalAddress.physicalAddress;
 if (addr.postalCode && addr.postalCode.length < 5) {
if (!errors.physicalAddress) errors.physicalAddress = {};
errors.physicalAddress.postalCode = "Invalid postal code";
 }
}

// Return errors if any found
if (Object.keys(errors).length > 0) {
 return Response.json({ errors });
}

// Success - return the request data wrapped in a request object
// The wallet expects the response to contain the original or modified calls
return Response.json({
 request: requestData
});

// Alternative: Explicitly enumerate fields if needed
// return Response.json({
// request: {
// calls: requestData.calls,
// chainId: requestData.chainId,
// capabilities: requestData.capabilities
// }
// });

 } catch (error) {
return Response.json({
 errors: { server: "Server error validating data" }
});
 }
}
```## Important Notes

1. **HTTPS Required**: Your callback URL must use HTTPS, even for local development. Use a service like ngrok for testing.

2. **Return Original or New Calls**: You MUST return the original calls or new calls in your success response. If you don't, the wallet will return an error.

3. **Optional Fields**: You can make any requested field optional by setting`optional: true`in the request. Optional fields will be marked as such in the Base Account interface.

4. **Privacy**: Users always have full control over their data. They can choose to share or withhold any information, and they're clearly shown what data you're requesting.

5. **Validation**: Base Account performs basic validation before sending data to your callback URL. This includes checking that emails are valid and addresses are properly formatted.



## UI ELEMENTS

# BasePayButton

> Pre-built React component for accepting payments with Base Account

The`BasePayButton`is a ready-to-use React component that provides a seamless payment experience using Base Account. It handles the entire payment flow including user interaction, transaction processing, and result handling.


> Warning:
**Please Follow the Brand Guidelines**

 If you intend on using the BasePayButton, please follow the [Brand Guidelines](/base-account/reference/ui-elements/brand-guidelines) to ensure consistency across your application.

## Installation

<CodeGroup>
#### Command```bash
 npm install @base-org/account-ui
```#### Command```bash
 pnpm add @base-org/account-ui
```#### Command```bash
 yarn add @base-org/account-ui
```#### Command```bash
 bun add @base-org/account-ui
```</CodeGroup>

## Basic Usage
#### Code```tsx
import { BasePayButton } from '@base-org/account-ui/react';

function PaymentForm {
 const handlePaymentResult = (result) => {
if (result.success) {
 console.log('Payment successful!', result);
} else {
 console.error('Payment failed:', result.error);
}
 };

 return (
<BasePayButton
 paymentOptions={{
amount: '10.00',
to: 'your-wallet.eth',
testnet: true
 }}
 colorScheme="light"
 onPaymentResult={handlePaymentResult}
/>
 );
}
```## Props

### paymentOptions (required)

Payment configuration object with the following properties:

<ParamField body="amount" type="string" required>
 The payment amount in USDC (e.g., "10.50" for \$10.50)
</ParamField>

<ParamField body="to" type="string" required>
 The recipient wallet address or ENS name
</ParamField>

<ParamField body="testnet" type="boolean">
 Whether to use testnet for the payment (default: false)
</ParamField>

<ParamField body="payerInfo" type="object">
 Object containing information requests to collect during payment
</ParamField>

### Styling Props

<ParamField body="colorScheme" type="'light' | 'dark' | 'system'">
 Color scheme for the button appearance (default: 'system')
</ParamField>

<ParamField body="size" type="'small' | 'medium' | 'large'">
 Button size (default: 'medium')
</ParamField>

<ParamField body="variant" type="'solid' | 'outline'">
 Button variant style (default: 'solid')
</ParamField>

<ParamField body="disabled" type="boolean">
 Whether the button is disabled (default: false)
</ParamField>

### Event Handlers

<ParamField body="onPaymentResult" type="function">
 Callback function called when payment completes (success or failure)
</ParamField>

<ParamField body="onClick" type="function">
 Custom click handler (called before payment processing)
</ParamField>

## Payment Options

### Basic Payment
#### Code```tsx
const paymentOptions = {
 amount: '25.00',
 to: '0x742d35Cc6634C0532925a3b844Bc9e7595f6E456',
 testnet: true
};

<BasePayButton
 paymentOptions={paymentOptions}
 colorScheme="light"
 onPaymentResult={handleResult}
/>
```### Payment with User Info Collection
#### Code```tsx
const paymentOptions = {
 amount: '49.99',
 to: 'store.eth',
 payerInfo: {
requests: [
 { type: 'email', optional: false },
 { type: 'name', optional: true },
 { type: 'physicalAddress', optional: false }
],
callbackURL: 'https://api.example.com/validate // Optional
 }
};

<BasePayButton
 paymentOptions={paymentOptions}
 onPaymentResult={(result) => {
if (result.success) {
 console.log('Payment successful!');
 console.log('User info:', result.payerInfoResponses);
}
 }}
/>
```## Styling Options

### Color Schemes
#### Code```tsx
{/* Light theme */}
<BasePayButton
 paymentOptions={paymentOptions}
 colorScheme="light"
/>

{/* Dark theme */}
<BasePayButton
 paymentOptions={paymentOptions}
 colorScheme="dark"
/>

{/* System theme (follows user's system preference) */}
<BasePayButton
 paymentOptions={paymentOptions}
 colorScheme="system"
/>
```### Sizes and Variants
#### Code```tsx
{/* Different sizes */}
<BasePayButton size="small" paymentOptions={paymentOptions} />
<BasePayButton size="medium" paymentOptions={paymentOptions} />
<BasePayButton size="large" paymentOptions={paymentOptions} />

{/* Different variants */}
<BasePayButton variant="solid" paymentOptions={paymentOptions} />
<BasePayButton variant="outline" paymentOptions={paymentOptions} />
```## Event Handling

### Payment Result Handling
#### Code```tsx
const handlePaymentResult = (result) => {
 if (result.success) {
// Payment successful
console.log('Transaction hash:', result.transactionHash);
console.log('Block number:', result.blockNumber);

// Handle user info if collected
if (result.userInfo) {
 console.log('User email:', result.userInfo.email);
 console.log('User name:', result.userInfo.name);
}

// Update UI, redirect, etc.
showSuccessMessage;
redirectToThankYouPage;
 } else {
// Payment failed
console.error('Payment error:', result.error);

// Handle different error types
if (result.error.includes('insufficient funds')) {
 showInsufficientFundsMessage;
} else if (result.error.includes('user rejected')) {
 showUserCancelledMessage;
} else {
 showGenericErrorMessage;
}
 }
};
```### Custom Click Handler
#### Code```tsx
const handleClick = => {
 // Custom logic before payment
 console.log('User clicked pay button');

 // Analytics tracking
 trackEvent('payment_button_clicked', {
amount: '10.00',
product: 'subscription'
 });

 // Validation
 if (!isValidPayment) {
alert('Please complete the form first');
return false; // Prevent payment
 }

 return true; // Continue with payment
};

<BasePayButton
 paymentOptions={paymentOptions}
 onClick={handleClick}
 onPaymentResult={handlePaymentResult}
/>
```## Complete Example
#### Code```tsx
import React, { useState } from 'react';
import { BasePayButton } from '@base-org/account-ui/react';

export default function CheckoutPage {
 const [loading, setLoading] = useState(false);
 const [paymentStatus, setPaymentStatus] = useState(null);

 const paymentOptions = {
amount: '29.99',
to: 'merchant.eth',
testnet: true,
payerInfo: {
 requests: [
{ type: 'email', optional: false },
{ type: 'name', optional: true },
{ type: 'physicalAddress', optional: false }
 ]
}
 };

 const handlePaymentResult = (result) => {
setLoading(false);

if (result.success) {
 setPaymentStatus({
type: 'success',
message: 'Payment successful!',
transactionHash: result.transactionHash,
userInfo: result.userInfo
 });

 // Send confirmation email
 if (result.userInfo?.email) {
sendConfirmationEmail(result.userInfo.email, result.transactionHash);
 }
} else {
 setPaymentStatus({
type: 'error',
message: `Payment failed: ${result.error}`
 });
}
 };

 const handleClick = => {
setLoading(true);
setPaymentStatus(null);
 };

 return (
<div className="checkout-page">
 <h2>Complete Your Purchase</h2>
 <div className="product-info">
<h3>Premium Subscription</h3>
<p>$29.99/month</p>
 </div>

 <BasePayButton
paymentOptions={paymentOptions}
colorScheme="light"
size="large"
disabled={loading}
onClick={handleClick}
onPaymentResult={handlePaymentResult}
 />

 {loading && (
<div className="loading">
 Processing payment...
</div>
 )}

 {paymentStatus && (
<div className={`status ${paymentStatus.type}`}>
 <p>{paymentStatus.message}</p>
 {paymentStatus.transactionHash && (
<p>Transaction: {paymentStatus.transactionHash}</p>
 )}
 {paymentStatus.userInfo && (
<div>
 <p>Email: {paymentStatus.userInfo.email}</p>
 {paymentStatus.userInfo.name && (
 <p>Name: {paymentStatus.userInfo.name.firstName} {paymentStatus.userInfo.name.lastName}</p>
 )}
</div>
 )}
</div>
 )}

 <style jsx>{`.checkout-page {
 max-width: 400px;
 margin: 0 auto;
 padding: 20px;
}

.product-info {
 background: #f5f5f5;
 padding: 20px;
 border-radius: 8px;
 margin-bottom: 20px;
}

.loading {
 text-align: center;
 margin-top: 15px;
 color: #666;
}

.status {
 margin-top: 20px;
 padding: 15px;
 border-radius: 8px;
}

.status.success {
 background: #d4edda;
 border: 1px solid #c3e6cb;
 color: #155724;
}

.status.error {
 background: #f8d7da;
 border: 1px solid #f5c6cb;
 color: #721c24;
}`}</style>
</div>
 );
}
```## TypeScript Support

The component is fully typed when using TypeScript:
#### Code```tsx
import { BasePayButton, PaymentOptions, PaymentResult } from '@base-org/account-ui/react';

interface CheckoutProps {
 amount: string;
 recipient: string;
}

function Checkout({ amount, recipient }: CheckoutProps) {
 const paymentOptions: PaymentOptions = {
amount,
to: recipient,
testnet: true
 };

 const handleResult = (result: PaymentResult) => {
// TypeScript provides full type safety
if (result.success) {
 console.log(result.transactionHash); // ✅ Type-safe
}
 };

 return (
<BasePayButton
 paymentOptions={paymentOptions}
 onPaymentResult={handleResult}
/>
 );
}
```## Testing

For testing your integration:

1. **Use testnet mode**: Set`testnet: true`in payment options
2. **Get test USDC**: Use [Circle's faucet](https://faucet.circle.com) on Base Sepolia
3. **Test different scenarios**: Try successful payments, cancellations, and errors
4. **Verify user info collection**: Test with different`payerInfo`configurations

The BasePayButton provides a complete, production-ready payment solution that handles all the complexity of crypto payments while providing a familiar user experience.


# SignInWithBaseButton

> Pre-built React component for user authentication with Base Account

The`SignInWithBaseButton`is a ready-to-use React component that provides a seamless authentication experience using Base Account. It handles the entire sign-in flow including wallet connection, message signing, and user authentication.


> Warning:
**Please Follow the brand guidelines**

 If you intend on using the SignInWithBaseButton, please follow the [Brand Guidelines](/base-account/reference/ui-elements/brand-guidelines) to ensure consistency across your application.

## Installation

<CodeGroup>
#### Command```bash
 npm install @base-org/account-ui
```#### Command```bash
 pnpm add @base-org/account-ui
```#### Command```bash
 yarn add @base-org/account-ui
```#### Command```bash
 bun add @base-org/account-ui
```</CodeGroup>

## Basic Usage
#### Code```tsx
import { SignInWithBaseButton } from '@base-org/account-ui/react';

function LoginForm {
 const handleSignIn = => {
console.log('User clicked sign in');
// Custom sign-in logic here
 };

 return (
<SignInWithBaseButton
 align="center"
 variant="solid"
 colorScheme="light"
 onClick={handleSignIn}
/>
 );
}
```## Props

### Styling Props

<ParamField body="align" type="'left' | 'center' | 'right'">
 Button alignment within its container (default: 'left')
</ParamField>

<ParamField body="variant" type="'solid' | 'transparent'">
 Button variant style (default: 'solid')
</ParamField>

<ParamField body="colorScheme" type="'light' | 'dark' | 'system'">
 Color scheme for the button appearance (default: 'system')
</ParamField>

<ParamField body="size" type="'small' | 'medium' | 'large'">
 Button size (default: 'medium')
</ParamField>

<ParamField body="disabled" type="boolean">
 Whether the button is disabled (default: false)
</ParamField>

### Event Handlers

<ParamField body="onClick" type="function">
 Callback function called when the button is clicked
</ParamField>

<ParamField body="onSignInResult" type="function">
 Callback function called when authentication completes (success or failure)
</ParamField>

## Styling Options

### Alignment
#### Code```tsx
{/* Left aligned */}
<SignInWithBaseButton align="left" onClick={handleSignIn} />

{/* Center aligned */}
<SignInWithBaseButton align="center" onClick={handleSignIn} />

{/* Right aligned */}
<SignInWithBaseButton align="right" onClick={handleSignIn} />
```### Variants
#### Code```tsx
{/* Solid variant (default) */}
<SignInWithBaseButton variant="solid" onClick={handleSignIn} />

{/* Transparent variant */}
<SignInWithBaseButton variant="transparent" onClick={handleSignIn} />
```### Color Schemes
#### Code```tsx
{/* Light theme */}
<SignInWithBaseButton colorScheme="light" onClick={handleSignIn} />

{/* Dark theme */}
<SignInWithBaseButton colorScheme="dark" onClick={handleSignIn} />

{/* System theme (follows user's system preference) */}
<SignInWithBaseButton colorScheme="system" onClick={handleSignIn} />
```### Sizes
#### Code```tsx
{/* Different sizes */}
<SignInWithBaseButton size="small" onClick={handleSignIn} />
<SignInWithBaseButton size="medium" onClick={handleSignIn} />
<SignInWithBaseButton size="large" onClick={handleSignIn} />
```## Authentication Flow Integration

### Complete Authentication Example
#### Code```tsx
import React, { useState } from 'react';
import { SignInWithBaseButton } from '@base-org/account-ui/react';
import { createBaseAccountSDK, getCryptoKeyAccount } from '@base-org/account';
import { createWalletClient, custom } from 'viem';
import { base } from 'viem/chains';

export default function AuthenticationDemo {
 const [user, setUser] = useState(null);
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState(null);

 const sdk = createBaseAccountSDK({
appName: 'Authentication Demo',
appLogoUrl: 'https://example.com/logo.png
appChainIds: [base.id],
 });

 const handleSignIn = async => {
setLoading(true);
setError(null);

try {
 // Get the provider and create wallet client
 const provider = sdk.getProvider;
 const client = createWalletClient({
chain: base,
transport: custom(provider)
 });

 // Get account address
 const [account] = await client.getAddresses;

 // Sign authentication message
 const message = `Sign in to MyApp at ${Date.now}`;
 const signature = await client.signMessage({
account,
message,
 });

 // Verify signature on backend (optional)
 const authResult = await verifySignature(account, message, signature);

 if (authResult.success) {
setUser({
 address: account,
 signature: signature,
 timestamp: Date.now
});
console.log('User authenticated successfully');
 } else {
throw new Error('Authentication verification failed');
 }
} catch (err) {
 console.error('Authentication failed:', err);
 setError(err.message || 'Authentication failed');
} finally {
 setLoading(false);
}
 };

 const handleSignOut = => {
setUser(null);
setError(null);
 };

 // Mock backend verification (replace with your API)
 const verifySignature = async (address, message, signature) => {
// Send to your backend for verification
const response = await fetch('/api/verify-signature', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ address, message, signature })
});
return response.json;
 };

 if (user) {
return (
 <div className="authenticated">
<h3>Welcome!</h3>
<p><strong>Address:</strong> {user.address}</p>
<p><strong>Signed in at:</strong> {new Date(user.timestamp).toLocaleString}</p>
<button onClick={handleSignOut} className="sign-out-btn">
 Sign Out
</button>
 </div>
);
 }

 return (
<div className="authentication">
 <h2>Sign In to Continue</h2>
 <p>Connect your Base Account to access the application</p>

 <SignInWithBaseButton
align="center"
variant="solid"
colorScheme="light"
size="large"
disabled={loading}
onClick={handleSignIn}
 />

 {loading && (
<div className="loading">
 Authenticating...
</div>
 )}

 {error && (
<div className="error">
 <p>Authentication failed: {error}</p>
 <button onClick={ => setError(null)}>Try Again</button>
</div>
 )}

 <style jsx>{`.authentication {
 max-width: 400px;
 margin: 0 auto;
 padding: 40px 20px;
 text-align: center;
}

.authenticated {
 max-width: 400px;
 margin: 0 auto;
 padding: 20px;
 background: #f8f9fa;
 border-radius: 12px;
}

.loading {
 margin-top: 20px;
 color: #666;
 font-style: italic;
}

.error {
 margin-top: 20px;
 padding: 15px;
 background: #f8d7da;
 border: 1px solid #f5c6cb;
 border-radius: 8px;
 color: #721c24;
}

.sign-out-btn {
 background: #6c757d;
 color: white;
 border: none;
 padding: 10px 20px;
 border-radius: 6px;
 cursor: pointer;
 margin-top: 15px;
}

.sign-out-btn:hover {
 background: #5a6268;
}`}</style>
</div>
 );
}
```### SIWE Integration
#### Code```tsx
import { createSiweMessage } from 'siwe';

const handleSignInWithSIWE = async => {
 try {
const provider = sdk.getProvider;
const client = createWalletClient({
 chain: base,
 transport: custom(provider)
});

const [account] = await client.getAddresses;

// Create SIWE message
const siweMessage = createSiweMessage({
 address: account,
 chainId: base.id,
 domain: window.location.host,
 nonce: Math.random.toString(36).substring(7),
 uri: window.location.origin,
 version: '1',
 statement: 'Sign in to MyApp with your Base Account'
});

// Sign the SIWE message
const signature = await client.signMessage({
 account,
 message: siweMessage.prepareMessage,
});

// Verify with your backend
const authResult = await fetch('/api/siwe-verify', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
message: siweMessage,
signature: signature
 })
});

if (authResult.ok) {
 const userData = await authResult.json;
 setUser(userData);
}
 } catch (error) {
console.error('SIWE authentication failed:', error);
 }
};

<SignInWithBaseButton
 align="center"
 variant="solid"
 colorScheme="light"
 onClick={handleSignInWithSIWE}
/>
```## Custom Button States

### Loading State
#### Code```tsx
function CustomSignInButton {
 const [isLoading, setIsLoading] = useState(false);

 const handleSignIn = async => {
setIsLoading(true);
try {
 // Authentication logic
 await authenticateUser;
} finally {
 setIsLoading(false);
}
 };

 return (
<SignInWithBaseButton
 disabled={isLoading}
 onClick={handleSignIn}
 colorScheme="light"
/>
 );
}
```### Error State Handling
#### Code```tsx
function SignInWithErrorHandling {
 const [error, setError] = useState(null);

 const handleSignIn = async => {
try {
 setError(null);
 await authenticateUser;
} catch (err) {
 if (err.code === 4001) {
setError('User rejected the authentication request');
 } else if (err.code === -32002) {
setError('Authentication request already pending');
 } else {
setError('Authentication failed. Please try again.');
 }
}
 };

 return (
<div>
 <SignInWithBaseButton
onClick={handleSignIn}
colorScheme="light"
 />
 {error && (
<div className="error-message">
 {error}
</div>
 )}
</div>
 );
}
```## Integration with Authentication Providers

### NextAuth.js Integration

Below is an example of how to configure NextAuth to use Base Account as a credentials provider, so you can use Base Account in your Next.js application.

<Note>
 **NextAuth.js Integration**

 [Next.js](https://nextjs.org/) is a popular React framework, and [NextAuth.js](https://next-auth.js.org/) is an authentication library for Next.js. It offers session management and providers.
</Note>
#### Code```tsx

import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { verifyMessage } from 'viem'

export default NextAuth({
 providers: [
CredentialsProvider({
 name: 'Base Account',
 credentials: {
address: { label: 'Address', type: 'text' },
message: { label: 'Message', type: 'text' },
signature: { label: 'Signature', type: 'text' },
 },
 async authorize(credentials) {
try {
 const isValid = await verifyMessage({
address: credentials.address,
message: credentials.message,
signature: credentials.signature,
 });

 if (isValid) {
return {
 id: credentials.address,
 name: credentials.address,
 email: null,
};
 }
 return null;
} catch (error) {
 return null;
}
 },
}),
 ],
});
```#### Code```tsx
// Frontend component
import { signIn } from 'next-auth/react';

const handleSignIn = async => {
 // ... get signature as before

 const result = await signIn('credentials', {
address: account,
message: message,
signature: signature,
redirect: false,
 });

 if (result?.ok) {
console.log('Signed in successfully');
 }
};
```## TypeScript Support
#### Code```tsx
import { SignInWithBaseButton } from '@base-org/account-ui/react';

interface AuthButtonProps {
 onAuthSuccess: (userAddress: string) => void;
 onAuthError: (error: string) => void;
}

function AuthButton({ onAuthSuccess, onAuthError }: AuthButtonProps) {
 const handleSignIn = async => {
try {
 // Authentication logic
 const userAddress = await authenticateUser;
 onAuthSuccess(userAddress);
} catch (error) {
 onAuthError(error.message);
}
 };

 return (
<SignInWithBaseButton
 align="center"
 variant="solid"
 colorScheme="light"
 onClick={handleSignIn}
/>
 );
}
```## Best Practices

1. **Handle Loading States**: Disable the button during authentication to prevent multiple attempts

2. **Error Handling**: Provide clear error messages for different failure scenarios

3. **Security**: Always verify signatures on your backend before trusting authentication

4. **User Experience**: Show clear feedback during the authentication process

5. **Accessibility**: The button includes proper ARIA labels and keyboard navigation

6. **Testing**: Test with different wallet states (connected, disconnected, etc.)

The SignInWithBaseButton provides a complete, production-ready authentication solution that handles all the complexity of wallet-based authentication while providing a familiar user experience.


# Brand Guidelines

> Design and brand guidelines for Sign in With Base and Base Pay buttons

export const SignInWithBaseButton = ({colorScheme = 'light'}) => {
 const isLight = colorScheme === 'light';
 return <button type="button" style={{
 display: 'flex',
 alignItems: 'center',
 justifyContent: 'center',
 gap: '8px',
 padding: '12px 16px',
 backgroundColor: isLight ? '#ffffff' : '#000000',
 border: 'none',
 borderRadius: '8px',
 cursor: 'pointer',
 fontFamily: 'system-ui, -apple-system, sans-serif',
 fontSize: '14px',
 fontWeight: '500',
 color: isLight ? '#000000' : '#ffffff',
 minWidth: '180px',
 height: '44px'
 }}>
 <div style={{
 width: '16px',
 height: '16px',
 backgroundColor: isLight ? '#0000FF' : '#FFFFFF',
 borderRadius: '2px',
 flexShrink: 0
 }} />
 <span>Sign in with Base</span>
 </button>;
};

export const BasePayButton = ({colorScheme = 'light'}) => {
 const isLight = colorScheme === 'light';
 return <button type="button" style={{
 display: 'flex',
 alignItems: 'center',
 justifyContent: 'center',
 padding: '12px 16px',
 backgroundColor: isLight ? '#ffffff' : '#0000FF',
 border: 'none',
 borderRadius: '8px',
 cursor: 'pointer',
 fontFamily: 'system-ui, -apple-system, sans-serif',
 minWidth: '180px',
 height: '44px'
 }}>
 <img src={isLight ? '/images/base-account/BasePayBlueLogo.png' : '/images/base-account/BasePayWhiteLogo.png'} alt="Base Pay" style={{
 height: '20px',
 width: 'auto'
 }} />
 </button>;
};

## Sign in With Base & Base Pay

Base account offers two buttons to use in your application:

* [**Sign in with Base**](/base-account/reference/ui-elements/sign-in-with-base-button): for user authentication for your product
* [**Base Pay**](/base-account/reference/ui-elements/base-pay-button): payments for online and offline goods

## Sign in with Base

Integrating "Sign in With Base" offers a convenient and trusted way for users to access your services. By leveraging their established Base account, users can avoid creating and remembering new credentials, leading to a smoother onboarding and login process.

<div style={{ display: 'flex', justifyContent: 'center', backgroundColor: '#000000', padding: '20px', borderRadius: '8px' }}>
 <SignInWithBaseButton />
</div>

<br />

<div style={{ display: 'flex', justifyContent: 'center', backgroundColor: '#ffffff', padding: '20px', borderRadius: '8px' }}>
 <SignInWithBaseButton colorScheme="dark" />
</div>

### Best Practices

To provide the best possible user experience when integrating "Sign in With Base," consider the following guidelines:

* **Offer Value for Sign-in**: Clearly communicate the benefits of signing in. Users should understand why they are being asked to sign in, such as to personalize their experience, access premium features, or synchronize data across devices.

* **Prominently Display the Button**: Make the "Sign in With Base" button easily discoverable. It should be no smaller than other sign-in options and should not require users to scroll to find it.

* **Consistent Placement**: Place the "Sign in With Base" button in a consistent and logical location on your sign-in and account creation screens.

### Design & Brand Guidelines

The "Sign in With Base" button should be easily recognizable and consistent across all platforms. Adhering to these design guidelines ensures a familiar and trusted experience for users.

#### Button Appearance

The "Sign in With Base" button has two key components:

1. **The Base logo is a blue square**
 * The square never changes shades of blue, it's always`#0000FF`* In dark mode, the square changes color to pure white`#FFFFFF`2. **The "Sign in with Base" text**
 * Always use "Sign in with Base" unless there's an explicit "Sign in" heading prior
 * Use "Base Sans" where possible, otherwise [create a custom button](#creating-a-custom-button)

Following are some DOs and DON'Ts for the Base branding:

#### DO

* Leave at least 8pt of padding in-between the base square and "Sign in with Base", if creating a custom button
* Use base blue on a white/light background
* Use the all-white lockup if on a black/dark background
* Use "Sign in with Base" (including "Sign in") unless "Sign in" is present as a heading on the screen

#### DON'T

* Use gradients for the logo
* Change the corner radius of the logo
* Change the color of the Base Square
* Use Base Blue on a dark background

Base offers the following out of the box components:


<div style={{ textAlign: 'center', fontStyle: 'italic', marginBottom: '2rem' }}>
 (Click to enlarge)
</div>


<div style={{ textAlign: 'center', fontStyle: 'italic', marginBottom: '2rem' }}>
 (Click to enlarge)
</div>

### Examples

<div style={{ textAlign: 'center', fontStyle: 'italic', marginBottom: '2rem' }}>
 (Click to enlarge)
</div>

### Creating a custom button

You can customize the "Sign in with Base" button to match the style of your application. Below is an example of Privy using Base branding within their user interface style.

Notice that:

* The ratio and color of the Base Square is maintained
* A "Sign in" header is present, so just "Base" is used as the sign in option

For detailed technical integration steps and API references, please refer to these docs.

## Base Pay

Integrating "Base Pay" offers one-click checkout for users with a Base Account. Integrate it into your product for easy purchase power for online and offline goods.

<div style={{ display: 'flex', justifyContent: 'center', backgroundColor: '#000000', padding: '20px', borderRadius: '8px' }}>
 <button
 type="button"
 style={{
 display: 'flex',
 alignItems: 'center',
 justifyContent: 'center',
 padding: '12px 16px',
 backgroundColor: '#ffffff',
 border: 'none',
 borderRadius: '8px',
 cursor: 'pointer',
 fontFamily: 'system-ui, -apple-system, sans-serif',
 minWidth: '180px',
 height: '44px'
 }}
 >
 ![](https://mintcdn.com/base-a060aa97/zJDlWs-ElgNXh0g7/images/base-account/BasePayBlueLogo.png?fit=max&auto=format&n=zJDlWs-ElgNXh0g7&q=85&s=8eedc35d29797d5cdf1ef2d735478430)
 </button>
</div>

<br />

<div style={{ display: 'flex', justifyContent: 'center', backgroundColor: '#ffffff', padding: '20px', borderRadius: '8px' }}>
 <button
 type="button"
 style={{
 display: 'flex',
 alignItems: 'center',
 justifyContent: 'center',
 padding: '12px 16px',
 backgroundColor: '#0000FF',
 border: 'none',
 borderRadius: '8px',
 cursor: 'pointer',
 fontFamily: 'system-ui, -apple-system, sans-serif',
 minWidth: '180px',
 height: '44px'
 }}
 >
 ![](https://mintcdn.com/base-a060aa97/zJDlWs-ElgNXh0g7/images/base-account/BasePayWhiteLogo.png?fit=max&auto=format&n=zJDlWs-ElgNXh0g7&q=85&s=5d59331efc45dac990a9321755d36f35)
 (Click to enlarge)
</div>

<div style={{ textAlign: 'center', fontStyle: 'italic', marginBottom: '2rem' }}>
 (Click to enlarge)
</div>

## Media Assets

You can find the full set of Base Brand Assets in the [Base Brand Page](https://base.org/brand)



## ONCHAIN CONTRACTS

# Spend Permissions

export const GithubRepoCard = ({title, githubUrl}) => {
 return <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="mb-4 flex items-center rounded-lg bg-zinc-900 p-4 text-white transition-all hover:bg-zinc-800">
 <div className="flex w-full items-center gap-3">
 <svg height="24" width="24" className="flex-shrink-0 dark:fill-white" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg>
 <path fill="currentColor" fillRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
 </svg>

 <div className="flex min-w-0 flex-grow flex-col">
 <span className="truncate text-base font-medium">{title}</span>
 <span className="truncate text-xs text-zinc-400">{githubUrl}</span>
 </div>

 <svg className="h-5 w-5 flex-shrink-0 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
 </svg>
 </div>
 </a>;
};

You can find the open-source contracts repository by clicking the button below:

<GithubRepoCard title="Spend Permissions" githubUrl="https://github.com/coinbase/spend-permissions />

### Structs

####`SpendPermission`Defines the complete parameters of a spend permission.


> Warning:
The fields of the`SpendPermission`structure must be strictly ordered as
 defined below.

| Field | Type | Description |
| ----------- | --------- | ------------------------------------------------------------------------------------------ |
|`account`|`address`| Smart account this spend permission is valid for. |
|`spender`|`address`| Entity that can spend`account`'s tokens. |
| `token`|`address`| Token address (ERC-7528 native token address or ERC-20 contract). |
|`allowance`|`uint160`| Maximum allowed value to spend within each`period`. |
| `period`|`uint48`| Time duration for resetting used`allowance`on a recurring basis (seconds). |
|`start`|`uint48`| Timestamp this spend permission is valid starting at (unix seconds). |
|`end`|`uint48`| Timestamp this spend permission is valid until (unix seconds). |
|`salt`|`uint256`| An arbitrary salt to differentiate unique spend permissions with otherwise identical data. |
|`extraData`|`bytes`| Arbitrary data to include in the permission. |

####`PeriodSpend`Describes the cumulative spend for the current active period.

| Field | Type | Description |
| ------- | --------- | ---------------------------------------- |
|`start`|`uint48`| Start time of the period (unix seconds). |
|`end`|`uint48`| End time of the period (unix seconds). |
|`spend`|`uint160`| Accumulated spend amount for period. |

***

### Contract functions

####`approve`Approve a spend permission via a direct call from the`account`. Only callable by the `account`specified in the spend permission.```solidity
function approve(SpendPermission calldata spendPermission) external;
```***

####`approveWithSignature`Approve a spend permission via a signature from the`account`owner. Compatible with [ERC-6492](https://eips.ethereum.org/EIPS/eip-6492) signatures for automatic account creation if needed.```solidity
function approveWithSignature(SpendPermission calldata spendPermission, bytes calldata signature) external;
```***

####`spend`Spend tokens using a spend permission, transferring them from the`account`to the`spender`. Only callable by the `spender`specified in the permission.```solidity
function spend(SpendPermission memory spendPermission, uint160 value) external;
```***

####`revoke`Revoke a spend permission, permanently disabling its use. Only callable by the`account`specified in the spend permission.```solidity
function revoke(SpendPermission calldata spendPermission) external;
```***

####`revokeAsSpender`Revoke a spend permission, permanently disabling its use. Only callable by the`spender`specified in the spend permission.```solidity
function revokeAsSpender(SpendPermission calldata spendPermission) external;
```***

####`getHash`Generate a hash of a`SpendPermission`struct for signing, in accordance with [EIP-712](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-712.md)
```solidity
function getHash(SpendPermission memory spendPermission) public view returns (bytes32);
```***

####`isApproved`Check if a spend permission is approved, regardless of whether the current time is within the valid time range of the permission.```solidity
function isApproved(SpendPermission memory spendPermission) public view returns (bool);
```***

####`isRevoked`Check if a spend permission is revoked, regardless of whether the current time is within the valid time range of the permission.```solidity
function isRevoked(SpendPermission memory spendPermission) public view returns (bool);
```***

####`isValid`Check if a spend permission is approved and not revoked, regardless of whether the current time is within the valid time range of the permission.```solidity
function isValid(SpendPermission memory spendPermission) public view returns (bool);
```***

####`getLastUpdatedPeriod`Retrieve the`start`, `end`, and accumulated `spend`for the last updated period of a spend permission.```solidity
function getLastUpdatedPeriod(SpendPermission memory spendPermission) public view returns (PeriodSpend memory);
```***

####`getCurrentPeriod`Retrieve the`start`, `end`, and accumulated `spend`for the current period of a spend permission.
Reverts if the current time is outside the valid time range of the permission, but does not validate whether the
spend permission has been approved or revoked.```solidity
function getCurrentPeriod(SpendPermission memory spendPermission) public view returns (PeriodSpend memory);
```# Smart Wallet

> ERC-4337 compliant smart contract wallet that serves as the foundation for Base Account.

export const GithubRepoCard = ({title, githubUrl}) => {
 return <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="mb-4 flex items-center rounded-lg bg-zinc-900 p-4 text-white transition-all hover:bg-zinc-800">
 <div className="flex w-full items-center gap-3">
 <svg height="24" width="24" className="flex-shrink-0 dark:fill-white" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg>
 <path fill="currentColor" fillRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
 </svg>

 <div className="flex min-w-0 flex-grow flex-col">
 <span className="truncate text-base font-medium">{title}</span>
 <span className="truncate text-xs text-zinc-400">{githubUrl}</span>
 </div>

 <svg className="h-5 w-5 flex-shrink-0 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
 </svg>
 </div>
 </a>;
};

You can find further documentation in the README of the repository below:

<GithubRepoCard title="Smart Wallet" githubUrl="https://github.com/coinbase/smart-wallet />

# Wallet Library Support

Below are some popular wallet libraries and what we know of their plans for day 1 support for Base Account.

| Name | Support |
| ---------------------------------------------------------------------------------- | ------- |
| [Dynamic](https://docs.dynamic.xyz/wallets/advanced-wallets/coinbase-smart-wallet) | ✅ |
| [Privy](https://docs.privy.io/guide/react/recipes/misc/coinbase-smart-wallets) | ✅ |
| [ThirdWeb](http://portal.thirdweb.com/connect) | ✅ |
| [ConnectKit](https://docs.family.co/connectkit) | ✅ |
| [Web3Modal](https://docs.reown.com/web3modal/react/smart-accounts) | ✅ |
| [Web3-Onboard](https://www.blocknative.com/coinbase-wallet-integration) | ✅ |
| [RainbowKit](https://www.rainbowkit.com/) | ✅ |



# Base Gasless Campaign

Base is offering gas credits to help developers make the most of
Base Account's [paymaster (sponsored transactions)](/base-account/improve-ux/sponsor-gas/paymasters) features.

| Partner Tier | Base Gas Credit Incentive | Requirements | Actions |
| ------------ | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 | \$15k | <ul><li>Support Base Account</li><li>Onboard to CDP Paymaster</li><li>Preferred placement in your UI (ie "Create Wallet" button)</li></ul> | <ol><li> Migrate your Coinbase SDK to add Base Account to your app, or bump to latest version of any supporting wallet library.</li><li> Sign in / up for [Coinbase Developer Platform](https://www.coinbase.com/developer-platform) (takes less than 2 minutes). No KYC needed - just email and phone.</li><li> Check out the Paymaster product where the Base Mainnet Paymaster is enabled by default. Set and change your gas policy at any time.</li><li> Complete [this form](https://docs.google.com/forms/d/1yPnBFW0bVUNLUN_w3ctCqYM9sjdIQO3Typ53KXlsS5g/viewform?edit_requested=true)</li><li>Credits will land within 1 week of completion</li></ol> |
| 2 | \$10k | <ul><li>Support Base Account</li><li>Onboard to CDP Paymaster</li></ul> | <ol><li> Migrate your Coinbase SDK to add Base Account to your app, or bump to latest version of any supporting wallet library.</li><li> Sign in / up for [Coinbase Developer Platform](https://www.coinbase.com/developer-platform) (takes less than 2 minutes). No KYC needed - just email and phone.</li><li> Check out the Paymaster product where the Base Mainnet Paymaster is enabled by default. Set and change your gas policy at any time.</li><li> Complete [this form](https://docs.google.com/forms/d/1yPnBFW0bVUNLUN_w3ctCqYM9sjdIQO3Typ53KXlsS5g/viewform?edit_requested=true)</li><li>Credits will land within 1 week of completion</li></ol> |
| Bonus | \$1k | <ul><li>Release demo</li></ul> | Create a demo of your Coinbase Base Account integration, post on social (Farcaster and/or X) and tag Coinbase Wallet and/or Base |



# Telemetry · Base Account

> Understanding Base Account's anonymous telemetry system and how to configure it.

Base Account includes an anonymous telemetry system to help us better understand how Base Account is used across applications and improve the developer experience. Participation in this anonymous program is optional—if you'd prefer not to share any usage data, you can easily opt out.

### Why Are We Collecting Telemetry?

Base Account provides critical wallet infrastructure for onchain applications with features like signing transactions & messages, signer management, and more. By collecting telemetry data, we can:

* **Monitor Wallet Operation Success**: Track which wallet operations (signing, connecting, transactions) are most reliable and identify failure patterns
* **Data-Informed Improvements**: Help our engineering team generate insights that drive future wallet enhancements and reliability improvements
* **Proactive Issue Detection**: Quickly detect issues with new SDK releases or wallet operations through operational metrics and error monitoring

### What Data Will Be Collected?

Telemetry data is completely anonymous and focused on functional metrics. Specifically, we collect:

* **Request Success Metrics**: Information about the success and failure rates of wallet requests to identify reliability issues
* **Error Events**: Generic error events with operational context to help us improve Base Account reliability
* **UI Component Usage**: Anonymous metrics on interface component functionality to ensure optimal reliability

**Privacy First**: No sensitive data—such as private keys, transaction contents, user addresses, or personal information—is ever collected.

### How Does It Work?

Telemetry is integrated into the Base Account SDK and automatically triggers when certain wallet events occur (provided telemetry is enabled in your configuration). The data is sent to secure Coinbase endpoints for analysis.

For example, when a wallet request occurs, a telemetry event like this is sent:
#### Command```bash
curl 'https://cca-lite.coinbase.com/amp \
 -H 'content-type: application/x-www-form-urlencoded; charset=utf-8' \
 -H 'origin: https://your-app.com \
 --data-raw 'e=[{"event_type":"scw_signer.request.started","event_properties":{"method":"eth_requestAccounts","correlationId":"abc123-def456","sdkVersion":"4.3.2","appName":"Your App Name","appOrigin":"https://your-app.com}}]'
```The payload contains an array of telemetry events with operational data including:

* **event\_type**: The specific wallet operation being tracked
* **method**: The wallet method being called (e.g.,`eth_requestAccounts`)
* **correlationId**: A unique identifier for request tracking
* **sdkVersion**: The Base Account SDK version
* **appName**: Your application name
* **appOrigin**: Your application's domain

### How Do I Opt Out?

By default, telemetry collection follows an opt-out model. If you'd like to disable telemetry in your app that uses the Base Account SDK, you can configure it during SDK initialization:
#### Code
```typescript
import { createCoinbaseWalletSDK } from "@coinbase/wallet-sdk";

const sdk = createCoinbaseWalletSDK({
 appName: "My App",
 appLogoUrl: "https://example.com/logo.png
 telemetry: false, // [!code focus]
});

const provider = sdk.getProvider;
```For legacy Coinbase Wallet SDK class based components:
#### Code```tsx
import { CoinbaseWalletSDK } from "@coinbase/wallet-sdk";

const sdk = new CoinbaseWalletSDK({
 appName: "My App",
 appLogoUrl: "https://example.com/logo.png
});

const provider = sdk.getProvider({
 telemetry: false, // [!code focus]
});
```We believe that this telemetry initiative will help us make Base Account even better for all developers—by focusing our improvements on the most critical wallet operations and catching issues early. If you have any questions or feedback, please reach out to the Base Account team.

Happy building with Base Account!

— The Base Account team


# Migrate from Coinbase Wallet SDK

> A guide to migrating from the Coinbase Wallet SDK to the Base Account SDK

## Overview

The Base Account SDK allows Base Account users to connect 3rd party mobile and web applications. The Base Account SDK is the successor to the Coinbase Wallet SDK, which is now considered legacy.

Developers should integrate the Base Account SDK such that users connect to use it via a "Sign in with Base" or "Base" button.

We do not recommend immediately replacing existing "Coinbase Wallet" buttons in your app, but rather add the Base Account button as an additional option, next to a "Coinbase Wallet" button. This will allow a transition period for users to get familiar with the new Base brand.

Driving this change is a transition of our mobile app: the Coinbase Wallet app is now the Base app. We are gradually transitioning all of our users to have Base Accounts, which are powered by our Smart Wallet platform.

Below is a table of existing users and how they will connect to apps now and in the future:

| User Type | Today | Future (\~Fall 2025) |
| --------------------------------------- | -------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Smart Wallet users (web and mobile app) | Automatically have a Base Account, can use "Sign in with Base" | No change |
| New Base app users | Automatically have a Base Account, can use "Sign in with Base" | No change |
| Coinbase Wallet Extension Users | Should continue to connect with "Coinbase Wallet" button | Will have a path to migrate to Base Account and use "Sign in with Base" |
| Coinbase Wallet mobile app EOA users | Should continue to connect with "Coinbase Wallet" button | Will have a path to migrate to Base Account and use "Sign in with Base" |

## Changes to user experience when click "Coinbase Wallet"

As of SDK v4.0, users without Coinbase Wallet extension are directed to a popup window where they can choose to connect with the mobile app, via WalletLink, or use a passkey-powered Smart Wallet natively on the web.

This will continue to be the case, but the logged out experience has changed to educate Smart Wallet users that they should be using "Sign in with Base" in the future. Here is how it looks on desktop.

<div style={{ display: 'flex', justifyContent: 'center', margin: '2rem 0' }}>
 ![](https://mintcdn.com/base-a060aa97/zJDlWs-ElgNXh0g7/images/base-account/CreateWalletFlow.png?fit=max&auto=format&n=zJDlWs-ElgNXh0g7&q=85&s=859cf28fbcae5e5d02ee2f63c034a738)
</div>

<div style={{ textAlign: 'center', fontStyle: 'italic', marginBottom: '2rem' }}>
 Desktop experience showing the updated logged out flow for Coinbase Wallet users
</div>


> Note:
If you would like to avoid users seeing any popup window, we recommend using a version of the Coinbase Wallet SDK \< 4.0.

 You can find the latest version of the Coinbase Wallet SDK [Releases](https://github.com/coinbase/coinbase-wallet-sdk/releases)

## How to migrate?

If you're using the SDK, you can simply replace the Coinbase Wallet SDK with the Base Account SDK.
#### Code```tsx
import { createBaseAccountSDK } from "@base-org/account";

const baseAccount = createBaseAccountSDK({
 // ...
});
```For more information please refer to the [Quickstart](/base-account/quickstart/web) guide.

If you're using a third party library, you can follow the [Wagmi](/base-account/framework-integrations/wagmi/setup), [Dynamic](/base-account/framework-integrations/nextjs-with-dynamic) or [Privy](/base-account/framework-integrations/privy/setup) guides.

We will have a more complete migration guide in the near future.




## BASENAMES

# Basenames FAQ

> Frequently asked questions on basenames.

## FAQ

### 1. What are Basenames?

[Basenames](https://base.org/names) are a core onchain building block that enable builders to establish their identity on Base by registering human-readable names for their wallet address(es). They are fully onchain, built on the same technology powering ENS names and deployed on Base. These human-readable names can be used when connecting to onchain apps, and sending and receiving on Base and any other EVM chain. Get your Basename at [base.org/names](https://base.org/names)

### 2. What are the Basename registration fees?

Basenames are priced based on name length, and are designed to be globally accessible. Annual registration fees are as follows:

| Letters | Annual fee |
| ------- | ---------- |
| 3 | 0.1 ETH |
| 4 | 0.01 ETH |
| 5-9 | 0.001 ETH |
| 10+ | 0.0001 ETH |

### 3. How do I get a free or discounted Basename?

You can get one free Basename (5+ letters) for one year if you meet any of the below criteria:

* [Coinbase Verification](http://coinbase.com/onchain-verify)
* [Summer Pass Level 3 NFT](https://wallet.coinbase.com/ocs)
* [Buildathon participant NFT](https://onchain-summer.devfolio.co/)
* [base.eth NFT holder](https://opensea.io/collection/base-org-base-eth)
* cb.id username (acquired prior to Fri Aug 9, 2024)
* [BNS name owner](http://basename.app) - free 4+ letter name (basename.app)

An equivalent-value discount of 0.001 ETH will be applied if registering a shorter name, or registering for more than 1 year, with the exception of the BNS name owner discount (valued at 0.01 ETH per unique address). You will need to pay the standard registration fees if you wish to keep your Basename after your initial discount has been fully applied. Discounts are only applied once, and are limited to one per address. Even if you meet multiple criteria, you will only be eligible for a single discount on one Basename. If you satisfy multiple criteria, we will automatically apply the highest-value discount to your registration.

We are always looking to add more discounts. If you or your project have ideas for more discounts, please reach out.

### 4. Why is there an auction at launch, and how does it work?

Upon initial launch, there will be a temporary premium placed on all Basenames in the form of a Dutch auction, to ensure a fair and quality distribution of names, and to maximize everyone's chance of getting a name they like without being outcompeted by bots. The premium will start at 100 ETH and decay exponentially over the course of 36 hours. Premiums will be added on to the total registration cost of a Basename. Please note: the premium is intentionally designed to be high so that names can't be instantly bought by bots or traders, and can instead enable fairer access and price discovery for the general public.

### 5. Do I have to pay gas to register a Basename?

If registering with a Base Account, registrations will be gasless, sponsored by Base.

### 6. How long can I register a Basename for?

There is no limit to registration length, but there is a minimum of 1 year.

### 7. How can I use my Basename?

You can use your Basename across apps in the Base ecosystem, starting with base.org, Onchain Registry, and Onchain Summer Pass. You can also use it for sending and receiving on Base and other EVM chains.

### 8. Is my profile information published onchain?

Basenames are fully onchain, and therefore any information you publish is recorded onchain, requires a transaction, and will be broadly composable with the rest of the ecosystem. Please do not publish any information you do not wish to be onchain.

### 9. How do I set my Basename as my primary name for my address?

You can set your Basename as your primary name through Profile Management. Setting your Basename as your primary name will display it on any wallet or app that has added support for Basenames.

**To set a basename as your primary name:**

* Navigate to [My Basenames](https://www.base.org/manage-names)
* Sign in with the wallet that now owns the basename
* Click the three dots of the basename you want to set as a primary name
* Click "Set as primary" and sign the transaction

### 10. How do I transfer my Basename to another address?

You can transfer your Basename to another address through Profile Management:


> Warning:
**Make sure to use the Basenames UI to send Basenames properly, sends on platforms like OpenSea will only transfer the NFT.**

Transfer token ownership - transfers ownership of the Basename token and associated permissions.\
Transfer management - transfers ability to manage and update profile records.\
Change address resolution - Basename will resolve to a new address.\
Transferring all 3 to the same address will fully transfer ownership of the Basename to that address.

Step by step:

* Navigate to [base.org/names](http://base.org/names)
* Sign in with wallet that owns the basename
* Click "My Basenames" in the top right corner
* Click the three dots of the basename you want to transfer and click transfer name
* Paste the ENS or address of the wallet you want to transfer the basename to
* Proceed to sign all four transactions to properly update the basename address, ownership, and profile records. The last transaction will be sending the NFT.

<Info>
 **For the new owner to use the basename they will need to confirm by setting it as their [primary name](#9-how-do-i-set-my-basename-as-my-primary-name-for-my-address).**
</Info>

### 11. What happens if I forget to renew my Basename?

If you forget to renew your Name, it will enter a grace period of 90 days, during which you can still renew it. If not renewed during this period, the Basename will become available for others to register.

### 12. What happens if a Basename is not renewed during the grace period?

If a Basename is not renewed after the 90 day grace period, it will be subject to a [temporary premium](https://support.ens.domains/en/articles/7900612-temporary-premium) in the form of a Dutch auction. This premium starts at 100ETH and will decay exponentially over the course of 21 days.

### 13. Can I link multiple addresses to my Basename?

Currently, only one address at a time can be linked to a Basename. However, we plan to support multi-address linking in the future.

### 14. I am a builder. How do I integrate Basenames to my app?

If you're a builder looking to integrate Basenames into your app, [OnchainKit](https://onchainkit.xyz/wallet/wallet-dropdown-basename) is the easiest way to get started (tutorial [Basenames Onchainkit Tutorial](https://docs.base.org/identity/basenames/basenames-onchainkit-tutorial) If you have ideas for new features or badges that you'd like to integrate with Basenames, we'd love to [hear from you](https://app.deform.cc/form/b9c1c39f-f238-459e-a765-5093ca638075/?page_number=0)

### 15. How do I get a Basename for my app or project?

You can register a Basename for your app just like any other Basename. If a Basename for your app or project is not available, there is a good chance it was reserved. Please reach out to our team or fill out this [form](https://app.deform.cc/form/20372eb6-ec97-4d37-967f-d36f4b7f4eb2) and we will reach out with instructions.

### 16. How are Basenames built?

Basenames are built using the Ethereum Name Service (ENS) protocol, leveraging its decentralized architecture to ensure secure and efficient name resolution.

### 17. Do Basenames work on different chains?

Yes, your Name will work on any chain as long as the app is ENSIP-10 compliant. Note that when sending money or interacting across different chains, you should ensure the receiving platform supports ENS.


# Basename Transfer Guide

> Step-by-step guide for Base App users to transfer their Basenames to new a wallet addresses.





#### Ek Varyant 2



## Transferring Your Basename to Your New Wallet

If you have an existing Basename you'd like to use, you'll need to transfer it to your new wallet address. We do not allow import or linking of pre-existing Basenames without transfer at this time.

### Before You Start

<Info>
 **Your new wallet address is ready**: We've automatically copied your new wallet address to your
 clipboard. You'll paste this when prompted.
</Info>


> Warning:
**Make sure to use the Basenames UI to send Basenames properly, sends on platforms like OpenSea
 will only transfer the NFT.**

### Step-by-Step Transfer Process

1. **Navigate to Basenames**

 * Go to [base.org/names](https://base.org/names)
 * Sign in with your current wallet (the one that owns the Basename)

2. **Access Your Basenames**

 * Click **"My Basenames"** in the top right corner
 * Find the Basename you want to transfer

3. **Start the Transfer**

 * Click the **three dots** next to your Basename
 * Select **"Transfer name"**

4. **Enter Your New Address**

 * When prompted for the destination address, **paste your new wallet address** (Ctrl/Cmd + V)
 * The address is already on your clipboard

5. **Complete the Transfer**
 * Sign all **four transactions** in sequence:
 * Transfer token ownership
 * Transfer management rights
 * Change address resolution
 * Send the NFT
 * Each transaction updates a different aspect of your Basename ownership

### After the Transfer

Once the transfer is complete, you'll need to activate your Basename on your new wallet:

1. Switch to your new wallet
2. Go to [base.org/manage-names](https://base.org/manage-names)
3. Sign in with your new wallet
4. Find your transferred Basename and click the three dots
5. Select **"Set as primary"** and sign the transaction

<Info>
 **For the new owner to use the basename they will need to confirm by setting it as their primary
 name.**
</Info>

### What This Transfer Includes

When you complete all four transactions, you're transferring:

**Transfer token ownership** - transfers ownership of the Basename token and associated permissions.\
**Transfer management** - transfers ability to manage and update profile records.\
**Change address resolution** - Basename will resolve to a new address.

Transferring all 3 to the same address will fully transfer ownership of the Basename to that address.

### Need Help?

If you encounter any issues during the transfer process, make sure:

* You're using the correct wallet (your old one) to initiate the transfer
* You've pasted the correct new wallet address
* You're completing all four transactions in the sequence

Your Basename will be fully functional on your new wallet once the transfer and primary name setup are complete.


# Basenames + OnchainKit Tutorial

> A tutorial that teaches how to integrate Basenames to your wagmi/viem App using OnchainKit

# Add Basenames to your wagmi/viem App using OnchainKit

Basenames is now live! But what exactly is it? Basenames allows users to register human-readable names for their addresses and serves as a foundational building block for onchain identity. Think of it as your favorite social media handle, but even bigger. Your Basename is multichain by default and yours forever—no platform can take it away from you (just make sure to pay your fee).

Integrating Basenames into your onchain app enhances the user experience by masking complex wallet addresses. Just as domains simplify IP addresses, Basenames do the same for wallet addresses.

OnchainKit is a React component library designed to make building Onchain applications easier. In this tutorial, we'll use the`<Identity/>`component to resolve Basenames.

This demo uses Coinbase Base Account and Coinbase Wallet, but Basenames is supported across many \[other wallets].

## Objectives

By the end of this tutorial, you should be able to:

* Understand how onchain identity works on the Base network
* Enable users to use their onchain identity in your app using \[OnchainKit]

***

If you're starting from scratch, you'll need to create a new wagmi project. If you already have an existing wagmi project, you can skip ahead to the section on installing OnchainKit.

To create a new wagmi project using TypeScript and install the required dependencies, run the following command:
#### Command```bash
bun create wagmi
```Next, you'll need to install OnchainKit. Run the following command:
#### Command```bash
bun add @coinbase/onchainkit
```After adding OnchainKit, install all dependencies and start your development server with:```bun install && bun run dev```This command will install the necessary dependencies and start a development server.

To follow along with the tutorial effectively, open your web browser and your IDE side by side. This setup will allow you to code and see the changes in real time.

### Update Wagmi config

In this section, we will configure your wagmi project to support the Base blockchain by importing the necessary modules.

Start by importing the`base`and`baseSepolia`chains into your wagmi config. Navigate to`src/wagmi.ts`and update the file as follows:
#### Code```typescript
import { http, cookieStorage, createConfig, createStorage } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { coinbaseWallet, injected } from 'wagmi/connectors';

export function getConfig {
 return createConfig({
chains: [base, baseSepolia],
connectors: [
 injected,
 coinbaseWallet({
appName: 'Create Wagmi',
preference: 'smartWalletOnly',
 }),
],
storage: createStorage({
 storage: cookieStorage,
}),
ssr: true,
transports: {
 [base.id]: http,
 [baseSepolia.id]: http,
},
 });
}

declare module 'wagmi' {
 interface Register {
config: ReturnType<typeof getConfig>;
 }
}
```This configuration sets up the wagmi project to connect to the Base and BaseSepolia networks, utilizing Coinbase Wallet and other connectors.


## BASE APP

## Introduction

# Base App Beta

> Frequently asked questions about the Base Wallet limited beta

Welcome to the Base app beta. Coinbase Wallet is now Base, an everything app to create, earn, trade, discover apps, and chat with friends all in one place.Here are answers to some frequently asked questions about the beta! Thank you for building with us.

## What is Base App

Base is the new name for Coinbase Wallet. A new experience is coming, with a current beta for some users. You can continue using the same Coinbase Wallet features in Base App.

## Who can participate in the beta?

The beta is currently open to a limited group of testers. We’ll be rolling out to more users on our waitlist soon.

## How do I get access to the beta app?

Join the waitlist at [base.app](http://www.base.app)

## Basenames

<AccordionGroup>
 <Accordion title="I already have a basename but it isn’t showing up/ I don’t have the option to transfer it.">
 A wallet can use multiple basenames. Sign up with a new basename, then transfer your existing basename to this new wallet. Here are the steps to transfer and use your existing basename.

 1. [Transfer the basename between wallets](https://docs.base.org/identity/basenames/basenames-faq#10-how-do-i-transfer-my-basename-to-another-address)
 2. [Set the basename as the primary name on your new wallet.](https://docs.base.org/identity/basenames/basenames-faq#9-how-do-i-set-my-basename-as-my-primary-name-for-my-address)
 </Accordion>

 <Accordion title="Will my basename show up on Farcaster?">
 Your basename will only be visible from users in the Base beta. Interaction from other clients will display your Farcaster username if you connected an account. If you create a new account your base name is set as the username on Farcaster.
 </Accordion>
</AccordionGroup>

## Wallet and Funds

### I logged into the beta, but don’t see my funds from my previous Coinbase Wallet.

The Base beta currently only supports smart wallets. Your funds are safe and still in the app. If you created a new smart wallet during the onboarding process, then your previous Externally Owned Account (EOA) wallet will only be available in the classic .

You can return to your previous wallet by toggling beta mode off.
Navigate to the Social tab (first icon), tap your profile pic, and toggle “beta mode” off.

### Smart Wallet

What is a smart wallet?
A smart wallet is a passkey-secured, self-custodial onchain wallet that's embedded in the app. It's designed for easy onboarding and better user experience. No browser extensions, no app switching.

If you don't have a smart wallet, you will create one in the onboarding flow for the new beta app.

**I have Base, but how do I know if I have a smart wallet?**

If you use a passkey to sign onchain transactions, you have a smart wallet. If you don't know or you have a 12 word recovery phrase backed up somewhere, you use an EOA (externally owned account), not a smart wallet.

From the in-app browser, go to wallet.coinbase.com and log in. If you have a smart wallet, you'll see it say "smart wallet" in your account details.

You'll be asked to create or import a smart wallet on the way into the beta. If you are uncertain, create a new wallet.

**Do I need a smart wallet for the beta?**
Yes. The beta is smart wallet only

### Common Issues

<AccordionGroup>
 <Accordion title="I logged into the beta, but don’t see my funds from my previous Coinbase Wallet.">
 The Base beta currently only supports smart wallets. Your funds are safe and still in the app. If you created a new smart wallet during the onboarding process, then your previous Externally Owned Account (EOA) wallet will only be available in the classic .

 <Info>
 You can return to your previous wallet by toggling beta mode off.
 Navigate to the Social tab (first icon), tap your profile pic, and toggle "beta mode" off.
 </Info>
 </Accordion>
</AccordionGroup>

## Farcaster Integration

<AccordionGroup>
 <Accordion title="How do I connect my Farcaster account?">
 Open the social tab and engage with any post (tap like or recast). You’ll be prompted to open the Farcaster app to connect your account. Follow the prompts to link Base Wallet to Farcaster.
 </Accordion>

 <Accordion title="What if I don't have a Farcaster account?">
 When signing up to the beta experience, you will be prompted to create a social account.
 </Accordion>
</AccordionGroup>

## Beta Management

### Toggling Beta Mode

**How can I toggle the beta off in Base again:** Navigate to the Social tab (first icon), tap your profile photo, and toggle “beta mode” off.

**I toggled beta mode off - how do I rejoin?** Navigate to the Assets tab (last tab on the right), select the settings icon in the upper right, and toggle “Beta mode”.

### Additional Questions

<AccordionGroup>
 <Accordion title="I needed to reinstall Base app and no longer have access to the beta - can I get another invite?">
 Unfortunately, our invites are one time use. If you uninstall the app, we aren’t able to add you back into the beta. However, all your wallets will still be available as long as you have your passkeys, backups, and recovery phrases.
 </Accordion>
</AccordionGroup>

## Launch Timeline

<AccordionGroup>
 <Accordion title="When will the official app launch?">
 We will announce the official app launch date soon - thanks for being a part of the beta!
 </Accordion>
</AccordionGroup>


## Chat Agents

# Chat Agents in Base App

> Learn how to build chat agents for Base App, using XMTP

This guide will cover how you can get started building messaging agents for Base App, using XMTP, a decentralized messaging protocol. Discover a fast, easy way to build and get distribution in Base App.

* Why agents?
* Getting started with XMTP
* Getting featured in Base App

## Why agents?

Messaging is the largest use-case in the world, but it’s more than just conversations—it’s a secure, programmable channel for financial and social innovation. When combined with the onchain capabilities of Base App, builders have a new surface area to build 10X better messaging experiences not currently possible on legacy platforms like WhatsApp or Messenger.

Real Examples:

• Smart Payment Assistant: Text "split dinner \$200 4 ways" and everyone gets paid instantly with sub-cent fees, no app switching or Venmo delays.

• AI Trading Companion: Message "buy $100 ETH when it hits $3,000" and your agent executes trades 24/7 while you sleep.

• Travel Planning Agent: "Book flight LAX to NYC under \$300" and get instant booking with crypto payments, all in your group chat

• Base App & XMTP are combining AI, crypto, and mini apps with secure messaging – to unlock use-cases never before possible. Secure group chats & DMs are the new surface area for developers.

## XMTP Documentation

Learn more about [XMTP](https://docs.xmtp.org/agents/get-started/build-an-agent) secure decentralized messaging network.

# UX Guidelines

> Learn the best practices and guidelines for creating quality agents

As you start building, review these guidelines to understand what makes an agent successful in the Base app. We recommend trying out existing agents in the app first to get a feel for the quality bar, what works well, and areas for improvement.

## Build a high quality foundation

Your agent should provide a seamless, professional experience that users will want to engage with repeatedly. Here are the core requirements:

### Responding to messages

**Multi-Channel Support**

* Respond to both DMs and group chats appropriately
* Maintain consistent functionality across different conversation types

**Immediate Feedback**

* React to messages with a simple reaction (👀, 👍, ⌛, etc.) to show acknowledgment
* This gives users confidence their message was received while processing

**Fast Response Times**

* Provide responses quickly (\< 5 seconds)
* Users expect near-instant communication in messaging apps

### Group Chat Etiquette

In group chats, agents should only respond when:

1. **Mentioned directly** with "@" + agent name (e.g., @bankr)
2. **Replied to directly** when a user replies to the agent's message using the reply content type

This prevents spam and ensures agents participate naturally in group conversations.

### Communication Style

**Sound Human**

* Use conversational, fun, and clear language
* Keep responses polished but not robotic
* Match the energy and tone of the conversation

**Privacy Conscious**

* Only ask for personal information when absolutely necessary
* Always explain why the information is needed
* Respect user privacy and data minimization principles

## Craft compelling onboarding

Your agent's first impression is critical. The onboarding message should immediately communicate value and give users a clear path forward.

### Great Onboarding Message Structure

1. **Introduce the agent** - Quick, friendly greeting with the agent's name
2. **Explain capabilities** - Clear, specific examples of what it can do
3. **Use quick select buttons** - Make it easy for users to select an action to take with the agent

### Example: High-Quality Onboarding```hey, i'm bankr. i can help you trade, transfer, and manage your crypto. here's the rundown:

• trade anything: buy, sell, swap tokens on base, polygon, and mainnet. try "buy 0.1 eth of degen."
• send it: transfer crypto to anyone on x, farcaster, or a wallet address.
• get alpha: token recs, market data, charts.
• automate: set up recurring buys/sells. e.g. "buy $10 of $bnkr every week."

what do you want to do first?```**Why this works:**

* Friendly, conversational tone
* Specific feature examples with concrete commands
* Clear value propositions
* Ends with a direct call-to-action

### Example: Poor Onboarding```Gm! What can I help you with?```**Why this fails:**

* Generic greeting with no context
* No explanation of capabilities
* Puts burden on user to figure out what to do
* No clear value proposition

## Showcase unique value

### Solve Real Problems

Your agent should:

* **Address a unique pain point** or bring a delightful twist to an existing space
* **Help users accomplish tasks** more easily than existing solutions
* **Provide clear benefits** that users can understand immediately

### Enable User Success

Focus on helping users:

* **Earn** - Generate income, rewards, or value
* **Connect** - Build relationships or communities
* **Have fun** - Provide entertainment or engaging experiences
* **Complete tasks** - Streamline workflows or processes

### Design for Engagement

**Build Natural Growth Loops**

* Include features that encourage sharing, re-engagement, and habit forming
* Make it beneficial for users to invite others
* Create ongoing value that brings users back

**Plan the User Journey**

1. **Define the ideal user experience first**
2. **Craft agent messages around that journey**
3. **Guide users through progressive value discovery**

### Continuous Engagement Strategy

As users complete actions with your agent:

* **Show clear next steps** - Always give users something else to try
* **Highlight ongoing value** - Explain how continued use benefits them
* **Create habit loops** - Design features that encourage regular interaction
* **Prevent one-and-done usage** - Build features that require return visits

### Examples of Engagement Features

* **Progressive features** - Unlock new capabilities as users engage more
* **Personalization** - Learn user preferences and customize experiences
* **Social elements** - Enable sharing achievements or inviting friends
* **Recurring value** - Automated tasks, alerts, or regular check-ins
* **Gamification** - Points, levels, or achievement systems


# Getting Started with Chat Agents

> Step-by-step guide to creating, testing, and deploying your first XMTP messaging agent

Build powerful chat agents that integrate seamlessly with Base App using the XMTP messaging protocol.

<Note>
 For the complete guide, visit [XMTP documentation](https://docs.xmtp.org/agents/get-started/build-an-agent)
</Note>

## Installation

<CodeGroup>
#### Command```bash
 npm install @xmtp/agent-sdk
```#### Command```bash
 pnpm add @xmtp/agent-sdk
```#### Command```bash
 yarn add @xmtp/agent-sdk
```</CodeGroup>

## Usage

This example shows how to create an agent that sends a message when it receives a text message.
#### Code```ts
import { Agent } from '@xmtp/agent-sdk';

// 2. Spin up the agent
const agent = await Agent.createFromEnv({
 env: 'production', // base app works only on production
});

// 3. Respond to text messages
agent.on('text', async (ctx) => {
 await ctx.sendText('Hello from my Base App Agent! 👋');
});

// 4. Log when we're ready
agent.on('start', => {
 console.log(`Waiting for messages...`);
 console.log(`Address: ${agent.address}`);
});

await agent.start;
```### Set environment variables

To run an example XMTP agent, you must create a`.env`file with the following variables:
#### Command```bash
XMTP_WALLET_KEY= # the private key of the wallet
XMTP_DB_ENCRYPTION_KEY= # encryption key for the local database
XMTP_ENV=production # local, dev, production
````

## Get a basename for your agent

Give your agent a human-readable name:

**1. Import agent wallet to Base App extension:**

• Install Base App browser extension

• Import using your agent's private key

**2. Purchase a basename:**

• Visit [https://base.org/names

• Connect your agent's wallet

• Search and purchase your desired basename (e.g., myagent.base.eth)

• Set as primary name

**3. Verify setup:**

• Your agent can now be reached via the basename instead of the long address

• Users can message myagent.base.eth instead of 0x123...

<Note>
 For the complete guide, visit [XMTP documentation](https://docs.xmtp.org/agents/get-started/build-an-agent)
</Note>

## COOKBOOK

## Use Cases

# Gasless Transactions on Base using a Paymaster

> Learn how to leverage the Base Paymaster for seamless, gasless transactions on the Coinbase Cloud Developer Platform.

export const Danger = ({children}) => {
return <div class="my-4 px-5 py-4 overflow-hidden rounded-2xl flex gap-3 border danger-admonition dark:danger-admonition">

 <div class="mt-0.5 w-4">
 <svg width="14" height="14" viewBox="0 0 14 14" fill="rgb(239, 68, 68)" xmlns="http://www.w3.org/2000/svg class="w-4 h-4 text-sky-500" aria-label="Danger">
 <path fill-rule="evenodd" clip-rule="evenodd" d="M7 1.3C10.14 1.3 12.7 3.86 12.7 7C12.7 10.14 10.14 12.7 7 12.7C5.48908 12.6974 4.0408 12.096 2.97241 11.0276C1.90403 9.9592 1.30264 8.51092 1.3 7C1.3 3.86 3.86 1.3 7 1.3ZM7 0C3.14 0 0 3.14 0 7C0 10.86 3.14 14 7 14C10.86 14 14 10.86 14 7C14 3.14 10.86 0 7 0ZM8 3H6V8H8V3ZM8 9H6V11H8V9Z"></path>
 </svg>
 </div>
 <div class="text-sm prose min-w-0">
 {children}
 </div>
 </div>;
};

Base transaction fees are typically less than a penny, but the concept of gas can still be confusing for new users and lead to poor user experience when users don't have gas funds in their wallet. You can abstract this away and improve your UX by using the **Base Paymaster**. The Paymaster allows you to:

- Batch multi-step transactions
- Create custom gasless experiences
- Sponsor up to \$15k monthly on mainnet (unlimited on testnet)

> Note:

## Objectives

1. Configure security measures to ensure safe and reliable transactions.
2. Manage and allocate resources for sponsored transactions.
3. Subsidize transaction fees for users, enhancing the user experience by making transactions free.
4. Set up and manage sponsored transactions on various schedules, including weekly, monthly, and daily cadences.

## Prerequisites

This tutorial assumes you have:

1. **A Coinbase Cloud Developer Platform Account**\
   If not, sign up on the [CDP site]. Once you have your account, you can manage projects and utilize tools like the Paymaster.

2. **Familiarity with Smart Accounts and ERC 4337**\
   Smart Accounts are the backbone of advanced transaction patterns (e.g., bundling, sponsorship). If you’re new to ERC 4337, check out external resources like the official [EIP-4337 explainer](https://eips.ethereum.org/EIPS/eip-4337) before starting.

3. **Foundry**\
   Foundry is a development environment, testing framework, and smart contract toolkit for Ethereum. You’ll need it installed locally for generating key pairs and interacting with smart contracts.

> Note:
> **Testnet vs. Mainnet**\
>  If you prefer not to spend real funds, you can switch to **Base Sepolia** (testnet). The steps below are conceptually the same. Just select _Base Sepolia_ in the Coinbase Developer Platform instead of _Base Mainnet_, and use a contract deployed on Base testnet for your allowlisted methods.

## Set Up a Base Paymaster & Bundler

In this section, you will configure a Paymaster to sponsor payments on behalf of a specific smart contract for a specified amount.

1. **Navigate to the [Coinbase Developer Platform].**
2. Create or select your project from the upper left corner of the screen.
3. Click on the **Paymaster** tool from the left navigation.
4. Go to the **Configuration** tab and copy the **RPC URL** to your clipboard — you’ll need this shortly in your code.

### Screenshots

- **Selecting your project**

![](https://mintcdn.com/base-a060aa97/yhxBW4teesnxVVBa/images/gasless-transaction-on-base/cdp-select-project.png?fit=max&auto=format&n=yhxBW4teesnxVVBa&q=85&s=ad65ae145f038beb29b5b0538d8d20bc)

- **Navigating to the Paymaster tool**

![](https://mintcdn.com/base-a060aa97/yhxBW4teesnxVVBa/images/gasless-transaction-on-base/cdp-paymaster.png?fit=max&auto=format&n=yhxBW4teesnxVVBa&q=85&s=7b6293dfe4563c17be199da2350f5826)

- **Configuration screen**

![](https://mintcdn.com/base-a060aa97/yhxBW4teesnxVVBa/images/gasless-transaction-on-base/cdp-config.png?fit=max&auto=format&n=yhxBW4teesnxVVBa&q=85&s=729f5128cf98287e52874446b44417e8)

### Allowlist a Sponsorable Contract

1. From the Configuration page, ensure **Base Mainnet** (or **Base Sepolia** if you’re testing) is selected.
2. Enable your paymaster by clicking the toggle button.
3. Click **Add** to add an allowlisted contract.
4. For this example, add [`0x83bd615eb93eE1336acA53e185b03B54fF4A17e8`][simple NFT contract], and add the function `mintTo(address)`.

![](https://mintcdn.com/base-a060aa97/yhxBW4teesnxVVBa/images/gasless-transaction-on-base/cdp-allowlist-contract.png?fit=max&auto=format&n=yhxBW4teesnxVVBa&q=85&s=c22391f42bb9b10e11d38fc68318469d)
<Note>
**Use your own contract**\
 We use a [simple NFT contract][simple NFT contract] on Base mainnet as an example. Feel free to substitute your own.
</Note>

### Global & Per User Limits

Scroll down to the **Per User Limit** section. You can set:

- **Dollar amount limit** or **number of UserOperations** per user
- **Limit cycles** that reset daily, weekly, or monthly

For example, you might set:

- `max USD`to`$0.05`\*`max UserOperation`to`1`This means **each user** can only have \$0.05 in sponsored gas and **1** user operation before the cycle resets.

<Note>
 **Limit Cycles**\
 These reset based on the selected cadence (daily, weekly, monthly).
</Note>

Next, **set the Global Limit**. For example, set this to`$0.07`so that once the entire paymaster has sponsored \$0.07 worth of gas (across all users), no more sponsorship occurs unless you raise the limit.

![](https://mintcdn.com/base-a060aa97/yhxBW4teesnxVVBa/images/gasless-transaction-on-base/cdp-global-user-limits.png?fit=max&auto=format&n=yhxBW4teesnxVVBa&q=85&s=2807bf6b44d653a07048688480048fcf)

## Test Your Paymaster Policy

Now let’s verify that these policies work. We’ll:

1. Create two local key pairs (or use private keys you own).
2. Generate two Smart Accounts.
3. Attempt to sponsor multiple transactions to see your policy in action.

### Installing Foundry

1. Ensure you have **Rust** installed

#### Command```bash

curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

````2. Install Foundry
#### Command```bash
 curl -L https://foundry.paradigm.xyz | bash
 foundryup
```3. Verify it works
#### Command```bash
 cast --help
```If you see Foundry usage info, you’re good to go!

### Create Your Project & Generate Key Pairs

1. Make a new folder and install dependencies,`viem`and`permissionless`:
#### Command
```bash
 mkdir sponsored_transactions
 cd sponsored_transactions
 npm init es6
 npm install permissionless
 npm install viem
 touch index.js
```2. Generate two key pairs with Foundry:
#### Command```bash
 cast wallet new
 cast wallet new
```You’ll see something like:
#### Command```bash
 Successfully created new keypair.
 Address: 0xD440D746...
 Private key: 0x01c9720c1dfa3c9...
```**Store these private keys somewhere safe**

### Project Structure With Environment Variables

Create a`.env`file in the`sponsored_transactions`directory. In the`.env`, you'll add the rpcURL for your paymaster and the private keys for your accounts:

<Info>
 **Find your Paymaster & Bundler endpoint**

 The Paymaster & Bundler endpoint is the URL for your Coinbase Developer Platform (CDP) Paymaster.
 This was saved in the previous section and follows this format: `https://api.developer.coinbase.com/rpc/v1/base/<SPECIAL-KEY>`Navigate to the [Paymaster Tool] and select the`Configuration`tab at the top of the screen to obtain your RPC URL.
</Info>

<Danger>
 **Secure your endpoints**

 You will create a constant for our Paymaster & Bundler endpoint obtained from cdp.portal.coinbase.com. The most secure way to do this is by using a proxy. For the purposes of this demo, hardcode it into our`index.js`file. For product, we highly recommend using a [proxy service].
</Danger>
#### Command```bash
PAYMASTER_RPC_URL=https://api.developer.coinbase.com/rpc/v1/base/<SPECIAL-KEY>
PRIVATE_KEY_1=0x01c9720c1dfa3c9...
PRIVATE_KEY_2=0xbcd6fbc1dfa3c9...
```<Danger>
 Never commit`.env`files to a public repo!
</Danger>

## Example`index.js`Below is a full example of how you might structure`index.js`.
#### Code
```js
// --- index.js ---
// @noErrors

// 1. Import modules and environment variables
import 'dotenv/config';
import { http, createPublicClient, encodeFunctionData } from 'viem';
import { base } from 'viem/chains';
import { createSmartAccountClient } from 'permissionless';
import { privateKeyToSimpleSmartAccount } from 'permissionless/accounts';
import { createPimlicoPaymasterClient } from 'permissionless/clients/pimlico';

// 2. Retrieve secrets from .env
// Highlight: environment variables for paymaster, private keys
const rpcUrl = process.env.PAYMASTER_RPC_URL; // highlight
const firstPrivateKey = process.env.PRIVATE_KEY_1; // highlight
const secondPrivateKey = process.env.PRIVATE_KEY_2; // highlight

// 3. Declare Base addresses (entrypoint & factory)
const baseEntryPoint = '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789';
const baseFactoryAddress = '0x15Ba39375ee2Ab563E8873C8390be6f2E2F50232';

// 4. Create a public client for Base
const publicClient = createPublicClient({
 chain: base,
 transport: http(rpcUrl),
});

// 5. Setup Paymaster client
const cloudPaymaster = createPimlicoPaymasterClient({
 chain: base,
 transport: http(rpcUrl),
 entryPoint: baseEntryPoint,
});

// 6. Create Smart Accounts from the private keys
async function initSmartAccounts {
 const simpleAccount = await privateKeyToSimpleSmartAccount(publicClient, {
privateKey: firstPrivateKey,
factoryAddress: baseFactoryAddress,
entryPoint: baseEntryPoint,
 });

 const simpleAccount2 = await privateKeyToSimpleSmartAccount(publicClient, {
privateKey: secondPrivateKey,
factoryAddress: baseFactoryAddress,
entryPoint: baseEntryPoint,
 });

 // 7. Create SmartAccountClient for each
 const smartAccountClient = createSmartAccountClient({
account: simpleAccount,
chain: base,
bundlerTransport: http(rpcUrl),
middleware: {
 sponsorUserOperation: cloudPaymaster.sponsorUserOperation,
},
 });

 const smartAccountClient2 = createSmartAccountClient({
account: simpleAccount2,
chain: base,
bundlerTransport: http(rpcUrl),
middleware: {
 sponsorUserOperation: cloudPaymaster.sponsorUserOperation,
},
 });

 return { smartAccountClient, smartAccountClient2 };
}

// 8. ABI for the NFT contract
const nftAbi = [
 // ...
 // truncated for brevity
];

// 9. Example function to send a transaction from a given SmartAccountClient
async function sendTransaction(client, recipientAddress) {
 try {
// encode the "mintTo" function call
const callData = encodeFunctionData({
 abi: nftAbi,
 functionName: 'mintTo',
 args: [recipientAddress], // highlight: specify who gets the minted NFT
});

const txHash = await client.sendTransaction({
 account: client.account,
 to: '0x83bd615eb93eE1336acA53e185b03B54fF4A17e8', // address of the NFT contract
 data: callData,
 value: 0n,
});

console.log(`✅ Transaction successfully sponsored for ${client.account.address}`);
console.log(`🔍 View on BaseScan: https://basescan.org/tx/${txHash}`;
 } catch (error) {
console.error('Transaction failed:', error);
 }
}

// 10. Main flow: init accounts, send transactions
(async => {
 const { smartAccountClient, smartAccountClient2 } = await initSmartAccounts;

 // Send a transaction from the first account
 await sendTransaction(smartAccountClient, smartAccountClient.account.address);

 // Send a transaction from the second account
 // For variety, let’s also mint to the second account's own address
 await sendTransaction(smartAccountClient2, smartAccountClient2.account.address);
});
```Now that the code is implemented, lets run it:
Run this via`node index.js`from your project root.
#### Command```bash
node index.js
```You should see a "Transaction successfully sponsored" output.

To confirm that your spend policies are correctly in place, try running the script again. If your Paymaster settings are strict (e.g., limit 1 transaction per user), the second time you run the script, you may get a “request denied” error, indicating the policy is working.

## Hitting Policy Limits & Troubleshooting

1. **Per-User Limit**\
 If you see an error like:
#### JSON```json
 {
 "code": -32001,
 "message": "request denied - rejected due to maximum per address transaction count reached"
 }
```That means you’ve hit your **UserOperation** limit for a single account. Return to the [Coinbase Developer Platform] UI to adjust the policy.

2. **Global Limit**\
 If you repeatedly run transactions and eventually see:
#### JSON```json
 {
 "code": -32001,
 "message": "request denied - rejected due to max global usd Spend Permission reached"
 }
```You’ve hit the **global** limit of sponsored gas. Increase it in the CDP dashboard and wait a few minutes for changes to take effect.

## Verifying Token Ownership (Optional)

Want to confirm the token actually minted? You can read the NFT’s`balanceOf`function:
#### Code```js
import { readContract } from 'viem'; // highlight

// example function
async function checkNftBalance(publicClient, contractAddress, abi, ownerAddress) {
 const balance = await publicClient.readContract({
address: contractAddress,
abi,
functionName: 'balanceOf',
args: [ownerAddress],
 });
 console.log(`NFT balance of ${ownerAddress} is now: ${balance}`);
}
````

## Conclusion

In this tutorial, you:

- Set up and **configured** a Base Paymaster on the Coinbase Developer Platform.
- **Allowlisted** a contract and specific function (`mintTo`) for sponsorship.
- Established **per-user** and **global** sponsorship **limits** to control costs.
- Demonstrated the **sponsorship flow** with Smart Accounts using `permissionless`, `viem`, and Foundry-generated private keys.

This approach can greatly improve your dApp’s user experience by removing gas friction. For more complex sponsorship schemes (like daily or weekly cycles), simply tweak your per-user and global limit settings in the Coinbase Developer Platform.

> **Next Steps**
>
> - Use a [proxy service][proxy service] for better endpoint security.
> - Deploy your own contracts and allowlist them.
> - Experiment with bundling multiple calls into a single sponsored transaction.

## References

- [list of factory addresses]
- [CDP site]
- [Coinbase Developer Platform]
- [UI]
- [proxy service]
- [Paymaster Tool]
- [Foundry Book installation guide]
- [simple NFT contract]

[list of factory addresses]: https://www.alchemy.com/docs/wallets/smart-contracts/deployed-addresses
[CDP site]: https://portal.cdp.coinbase.com/
[Coinbase Developer Platform]: https://portal.cdp.coinbase.com/
[UI]: https://portal.cdp.coinbase.com/products/bundler-and-paymaster
[proxy service]: https://www.smartwallet.dev/guides/paymasters
[Paymaster Tool]: https://portal.cdp.coinbase.com/products/bundler-and-paymaster
[Foundry Book installation guide]: https://book.getfoundry.sh/getting-started/installation
[simple NFT contract]: https://basescan.org/token/0x83bd615eb93ee1336aca53e185b03b54ff4a17e8

**Happy Building on Base!**

VIBE CODE A MINI APP

## Foundations

# Introduction to Mini Apps

> Mini Apps represent a paradigm shift in application development and distribution

#### Ek Varyant 2

Mini Apps are a new way to build and share apps—designed for the internet we actually use today: fast, social, and always on. They're not "mini" because they're small in impact, but because they're lightweight, easy to create, and instantly accessible.

Instead of requiring users to download a full app or sign up for a new account, Mini Apps work directly inside the Base App. That means someone can open your app from a social feed, use it immediately, and share it with friends—all in one flow. Whether it's a poll, a marketplace, or a game, Mini Apps are designed to spread through networks, not app stores.

They also come with powerful features out of the box: decentralized identity, built-in payments, and seamless social connection. You don't need to worry about distribution rules or platform lock-in. Your app lives on open infrastructure—and your users own their experience.

# Vibe Coding a Mini App

In the following sections you will be guided through the best practices for vibe coding a mini app game starting with te fundamentals of prompting, what documentation to leverage, to deployment and posting.

Mini Apps are lightweight web applications that run across Farcaster clients like Farcaster and TBA. Posting your mini app and TBA will populate on Farcaster and visa versa

# What is The Base App (TBA)?

The Base App (TBA) is your new home onchain—a place where you can post, message, pay, trade, and build. It brings together everything people love about the internet, but without the walls of traditional platforms. And it's built entirely on open protocols, so anyone with an internet connection can join or create.

TBA feels like a familiar social app, but underneath, it's a new kind of operating system for the onchain world. You can create content, earn from it, chat with friends, discover Mini Apps, and even launch your own—all in one place. It's multiplayer by default and designed for everyday people, not just crypto pros.

Creators can earn directly from their posts through "coined content," where likes, shares, and interactions come with real upside. App developers can publish Mini Apps that are instantly discoverable in the social feed and inside chat. And users get a universal wallet, human-readable identity (Basenames), and gasless payments from the start.

TBA isn't just a product—it's a protocol anyone can build on. You own your content, your apps, and your relationships. No gatekeepers, no downloads, no limits.

# Vibe Coding Fundamentals

> Combine traditional web development with AI-powered code generation

# Vibe Coding Mini Apps

Mini Apps are just web apps—with added capabilities. If you've built a website, you're already halfway there. The difference is that Mini Apps are designed to work seamlessly inside social feeds, come with built-in wallets, and connect to open, onchain identity.

The easiest way to get started is with MiniKit, a toolkit that gives you ready-to-go templates. These templates handle the heavy lifting—wallet integration, social feed support, and identity management—so you can focus on what your app actually does.

You can also build using AI tools that turn ideas into code. Tools like [Vercel V0](https://v0.dev/ [Claude Code](https://www.anthropic.com/claude-code and [Loveable](https://lovable.dev/) let you describe your app in plain language and generate working code in minutes. They're perfect for creators, vibe coders, and anyone who wants to build without spending weeks learning a new framework.

In this guide, we'll use AI to help build a Mini App that also works as a standalone website. That means what you build can live on Base, show up in TBA, and still work on the open web.

## Vibe Coding Elements

Vibe coding is a powerful way to bring your idea to life especially for non-developers.

Below are the elements that you will need to consider when vibe coding a mini app.

### Step: Plan

Clarify the app's purpose, target audience, and core features. Decide on the minimum viable product (MVP) and ensure it's achievable within your available time and resources.

### Step: UX + Architecture

Map out the user journey, key screens, and interactions. Choose the tech
stack, plan integrations (APIs, onchain features, etc.), and decide on the
app's overall architecture.

### Step: Build the Core Features

Implement the primary functionality first, focusing on the MVP. Keep
components modular for easier testing and iteration.

### Step: Test & Refine

Run functional, performance, and user tests to catch bugs and improve the
experience. Incorporate feedback and make necessary adjustments.

### Step: Deploy & Share

Deploy to your hosting platform (e.g., Vercel, Fleek). Share the app with your intended audience, gather real-world feedback, and iterate as needed.

# Master Prompt Engineering

> Learn best practices for writing effective prompts that generate useful code and UI components for your Mini App

## What makes a good prompt

Prompting well is a core skill—it unlocks faster results, better apps, and more creativity. Here's how to improve:

- **Start with a clear goal.** Be specific about what the app should do, who it's for, and how users will interact with it.
- **Give context.** Tell the AI what platform you're building for (TBA), what tools you're using (MiniKit, React, Tailwind), and what kind of experience you want to create.
- **Iterate in small steps.** Don't try to get everything perfect in one go. Run your prompt, review the output, and refine your request to get closer to your vision.
- **Use `llms.txt`files.** These are AI-friendly docs provided by many blockchain tools. Including their contents (or linking to them) gives the AI better reference data.
- **Read your prompt out loud.** If it sounds confusing to you, it'll confuse the AI too.
- **Save good prompts.** Treat them like building blocks. You'll reuse them across projects.

## What makes a prompt effective

- **State the goal and audience** so the model knows what to optimize. This keeps answers focused on the right use case instead of generic solutions.
- **Use sections and lists** to structure thinking and outputs, making it easier for the model to organize and for you to read.
- **Name users, roles, and permissions** to anchor behavior and prevent gaps in access planning.
- **List core features as outcomes** rather than vague ideas so results are actionable.
- **Define data entities and fields** to guide consistent responses and align on what's being stored or displayed.
- **Call out non-functional needs** like security and performance so they aren't forgotten in planning.
- **Provide tech preferences and constraints** to narrow options and avoid irrelevant suggestions.
- **Specify deliverables and format** so outputs are ready to use without heavy rework.
- **Phase the plan** to keep scope lean and shippable. _Example:_ Phase 1 = basic employee profiles and login, Phase 2 = payroll and payslips, Phase 3 = attendance and reviews.
- **Exclude out-of-scope items** to prevent feature creep and keep the project realistic.
- **Invite assumptions** when details are missing so progress continues without waiting on answers.

<AccordionGroup>
 <Accordion title="Prompt Template">```I want to build a Mini App for the Base App (TBA)—a social platform where users can post, trade, message, and earn. Please create a responsive React component that includes:

CORE FUNCTIONALITY:

[Briefly describe your app's purpose, e.g., "a mood tracker that lets users log their feelings and share their vibe"]

[List 2–3 features the app should include, like: mood selection, daily recap, emoji reactions]

[Mention if the app needs to store or display any user data]

TECH REQUIREMENTS:

Use React with TypeScript

Integrate wallet connection using MiniKit SDK

Allow users to post to the TBA social feed

Use Tailwind CSS for styling

Ensure it's mobile-responsive

VISUAL STYLE:

Clean, modern design

[Optional: Specify colors or mood — e.g., "calming blues and purples"]

Include clear call-to-action buttons

Optimize layout for mobile users

SOCIAL FEATURES:

Show user's Basename if connected

Let users react to each other's posts (e.g., emoji or stickers)

Enable easy sharing or reposting

Please return complete, working code with clear comments that explain each part.```</Accordion>

 <Accordion title="Make any prompt better">
 Create an effective prompt from a weak one using the template:```You are an expert prompt engineer. I will give you (A) my rough/weak prompt and (B) a proven prompt template. Rewrite (A) to fully conform to (B), filling required sections with best-guess placeholders where my info is missing, and adding only what the template structure requires.

Constraints:

- Keep my original intent, audience, and scope.
- Use clear sections and bullet points.
- Specify deliverables and output format.
- List assumptions you made at the end.

Inputs:
(A) ROUGH_PROMPT:

---

## <paste your rough prompt>

## (B) TEMPLATE:

## <paste the prompt template>

Output:

- Final improved prompt that follows the template
- Short list of assumptions (if any)```</Accordion>
  </AccordionGroup>

## Additional Resources

Here are essential resources to support your Mini App development journey:

- [AI Prompting Guide](https://docs.base.org/onchainkit/guides/ai-prompting-guide#developers-guide-to-effective-ai-prompting) – Strategies for better AI-assisted development
- [MiniKit Documentation](https://docs.base.org/base-app/guides) – Complete guide to Mini App tools and APIs
- [Base Documentation](https://docs.base.org) – Technical documentation for the Base blockchain
- [OnchainKit Components](https://onchainkit.xyz) – Pre-built React components for onchain functionality
- [Vercel V0 Documentation](https://vercel.com/docs) – Build UIs with natural language
- Base Community Discord – Connect with other builders
- [Farcaster Dev Resources](https://docs.farcaster.xyz) – Build with Farcaster social protocols
- [Base App Developer Portal](https://base.dev) – Tutorials, guides, and tools for Base developers
- [https://v0.app/chat/design-planning-for-team-management-site-jazkKQyN4Ok

# Essential Documentation Resources

> Navigate key documentation sources and understand when to use each resource for specific development needs

# Developer Resources

When building a Mini App for the Base App (TBA) and Farcaster, there are five main documentation sources you’ll use again and again. These aren’t just docs—they’re tools that will help you solve problems, debug issues, and keep shipping.

Don’t worry if they feel intimidating at first. You’re not expected to memorize them. Instead, you’ll learn to reference and search these docs as needed—and prompt your AI assistant to help you understand and use them. (We’ll show you how to do that in the next section.)

Here’s the key idea:

- **Base Docs** focus on the Base chain and app platform—everything from MiniKit to OnchainKit to smart account tools.
- **Coinbase Developer Platform (CDP)** gives you access to infrastructure tools—wallet APIs, Paymaster, and fiat onramps. Think of it as the backend services layer behind your app.

Use the table below to get a feel for when to reach for each one:

| Documentation                     | Helps with                                               | When to use it                                                          | Example prompt                                                                                                                                                                                                                                                                                              |
| :-------------------------------- | :------------------------------------------------------- | :---------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Base Docs                         | Base Chain, Base Account, Base App, OnchainKit, Cookbook | Finding MiniKit templates; sponsoring transactions via Base Account     | `Using the Base documentation at docs.base.org, help me implement wallet connection in my Mini App. I need to: 1) Connect to a user's wallet, 2) Display their Basename if available, 3) Show their account balance. Provide complete React code using MiniKit SDK with TypeScript and explain each step.`  |
| Coinbase Developer Platform (CDP) | Wallet services, Paymaster, onramps                      | Obtaining API keys; using the Paymaster endpoint; creating fiat onramps | `I want to sponsor transactions for my Mini App users using Coinbase Paymaster. Based on the CDP documentation, provide: 1) Setup instructions for API keys, 2) Complete code example for sponsoring a transaction, 3) Error handling best practices. Include both frontend and any required backend code.` |
| Next.js Docs                      | App router, page rendering, project structure            | Deciding where to store assets; understanding routing and SSR/SSG       | `Using Next.js 14 App Router, help me structure my Mini App with: 1) A main app page, 2) A settings page, 3) API routes for data fetching, 4) Proper file organization for components and assets. Provide the complete folder structure and explain routing patterns.`                                      |
| Wagmi / Viem                      | Wallet integration and on-chain data access              | Retrieving connected wallet address; reading on-chain data              | `Using Wagmi v2 and Viem, create a React hook that: 1) Connects to the user's wallet, 2) Reads their ETH balance on Base, 3) Fetches their last 5 transactions, 4) Handles loading and error states. Include TypeScript types and proper error handling.`                                                   |
| Vercel V0 Docs                    | AI-powered UI generation with V0                         | Adding environment variables; downloading generated code                | `I generated a Mini App UI with V0 and want to deploy it. Help me: 1) Add environment variables for my API keys, 2) Download and integrate the V0 code into my local MiniKit project, 3) Deploy to Vercel with proper configuration. Provide step-by-step instructions.`                                    |

---

## Example Prompt for Understanding Key Tools

Use prompts like the one below to help an AI assistant explain concepts from documentation:```Help me understand blockchain frontend development by explaining these concepts in simple terms:

1.  What is Wagmi and how does it simplify wallet connections in React?
2.  How does Viem handle low-level blockchain operations?
3.  What's the difference between reading blockchain data and writing transactions?
4.  How do these tools work together in a typical Mini App?

Focus on the Base network and provide practical examples for each concept. Include code snippets where helpful.```In the next section, we’ll show you how to prompt AI tools to make sense of all this documentation—so even the complex stuff becomes easier to use.

# AI-Assisted Documentation Reading

> Develop strategies for using AI tools to understand complex technical documentation and troubleshoot development challenges

# Techniques for understanding documentation

AI tools excel at breaking down complex technical content into understandable explanations and practical guidance tailored to your specific learning needs and project requirements. Below are three techniques that you can use to leverage AI to help you understand documentation.

### Used tailored prompts

The "Explain Like I'm a Vibe Coder" approach involves asking AI to simplify technical concepts while maintaining practical applicability. This technique is particularly effective for understanding blockchain concepts, API documentation, and complex development patterns. The key is providing context about your current knowledge level and specific goals rather than asking for generic explanations.

<Accordion title="Explain Like I'm a Vibe Coder Prompt">``I'm looking at this API documentation but finding it confusing. 
 I want to implement the`Checkout`component on the checkout.tsx page of my website. 
 Please explain this like I'm a Vibe Coder (someone new to blockchain development but familiar with basic web development):``#### Code```typescript
const chargeHandler = async => {
const response = await fetch('/createCharge', { method: 'POST' });
const { id } = await response.json;
return id; // Return charge ID
};

 <Checkout chargeHandler={chargeHandler}>
<CheckoutButton />
 </Checkout>;
```</Accordion>

### Use Screenshots

Sharing a screenshot with AI enhances its ability to understand your problem significantly. When you encounter confusing documentation sections, interfaces, or error messages, including screenshots in your AI prompts provides visual context that pure text cannot convey. Most AI tools can analyze images and provide specific guidance based on what they observe in your screenshots.

<Accordion title="Screenshot Prompt">```I'm looking at this API documentation but finding it confusing. I want to implement the`Checkout`component on the checkout.tsx page of my website.

I have attached two screenshots. The first screenshot is the page I would like to implement the`Checkout`component on. The second screenshot is the API documentation I am looking at.

Please explain this like I'm a Vibe Coder (someone new to blockchain development but familiar with basic web development):

[Screenshot 1]

[Screenshot 2]```</Accordion>

### Use code snippets

Code snippet analysis is another powerful technique. When you find example code in documentation but don't understand how it applies to your situation, you can paste the code into an AI prompt along with your specific requirements. The AI can explain the code's purpose, modify it for your needs, and highlight potential issues or improvements.

<Accordion title="Code Snippet Prompt">```I'm looking at this API documentation but finding it confusing. Please explain this like I'm a Vibe Coder (someone new to blockchain development but familiar with basic web development):

[PASTE DOCUMENTATION SECTION HERE]

Specifically help me understand:

1.  What this API does in simple terms
2.  When I would use it in my Mini App
3.  What the key parameters mean
4.  A practical example with my specific use case: [DESCRIBE YOUR USE CASE]

Break it down step-by-step and include a working code example I can copy and modify.`</Accordion>`

````# Mini App Successes in TBA

> Understand how to leverage Base features strategically to create Mini Apps that thrive within the Base App ecosystem

# Optimizing for Base App Success

Mini Apps succeed when they create the smoothest possible user experience. **MiniKit**, powered by **Base Account**, lets people use your app without having to sign in or build a separate "connect wallet" flow. It makes interacting with your app feel snappy and familiar. **Paymaster** removes first-time friction by covering gas so users can act right away. **Batched transactions** reduce pop-ups and approvals to a single, clear confirmation. Together, these components make Mini Apps feel cohesive and keep quality high across the Base ecosystem.

| Component | Optimization Strategy | Implementation Focus | Success Metrics |
| :------------------- | :-------------------------------- | :------------------------------------ | :--------------------------- |
| Smart Accounts | Leverage universal wallet support | Design simplified onboarding flows | User conversion rates |
| OnchainKit | Import proven components | Customize for specific use cases | Development velocity |
| Paymaster (Gasless) | Strategic transaction sponsorship | Optimize cost vs. experience balance | User engagement rates |
| Batched Transactions | Reduce interaction complexity | Bundle related operations efficiently | Transaction completion rates |


### Step: Audit Connect Walet touchpoints
If you are using a custom wallet connection flow, you can replace it with
 MiniKit + Base Account.

### Step: Adopt OnchainKit where it fits
Evaluate which OnchainKit components can replace custom implementations to
 align with Base UI patterns and speed up development.

### Step: Implement Paymaster
If you app requires a user to mint a NFT or submit a transaction onchain,
 ensure it is gasless by making that component interact with a Paymaster.

### Step: Use Batched Transactions
If you are using doing multiple transactions in a row, you can use batched
 transactions to reduce the number of popups and approvals.

Below is a prompt that will help you optimize your Mini App for maximum success in the Base App ecosystem.```Help me optimize my Mini App for maximum success in the Base App ecosystem:

CURRENT APP ANALYSIS:

- App type: [DESCRIBE YOUR MINI APP]
- Current user journey: [OUTLINE KEY USER STEPS]
- Main friction points: [IDENTIFY USER EXPERIENCE ISSUES]
- Target metrics: [DEFINE SUCCESS MEASUREMENTS]

SMART ACCOUNT OPTIMIZATION:

- Simplify user onboarding to leverage universal wallet support
- Remove unnecessary wallet complexity from user flows
- Design authentication that feels like traditional app login
- Optimize for users who don't understand blockchain concepts

ONCHAINKIT INTEGRATION:

- Identify which custom components can be replaced with OnchainKit
- Optimize component customization for brand consistency
- Implement proper error handling and loading states
- Ensure accessibility compliance for all components

PAYMASTER STRATEGY:

- Analyze which transactions should be sponsored for maximum impact
- Calculate sustainable sponsorship budget based on user volume
- Implement intelligent sponsorship rules and fallback options
- Design user communication about gasless benefits

BATCHED TRANSACTION OPTIMIZATION:

- Identify operations that can be combined for better UX
- Design single-signature flows for complex operations
- Handle partial failures and edge cases gracefully
- Optimize gas efficiency while maintaining reliability

Provide specific implementation recommendations with code examples and measurable optimization targets for each component.



# Build Your Mini App With a Prompt

> Use AI to draft your Mini App’s UI quickly—then iterate on layout, flows, and components before adding onchain features

# Your First Mini App Prompt

Now that you’ve seen how to write effective prompts and where to find help, it’s time to build your first interface. In this section we’ll focus on the visuals: screens, flows, buttons, and layout. No onchain features yet—just getting the look and feel right so you can move fast.


> Note:
Use a split-screen setup if your display allows. Keep **Vercel V0** open in
 one window for generating UI, and a second window for **ChatGPT (or another
 LLM)** plus a **Google Doc** for drafting and iterating on your prompt, and
 skimming docs as needed. This reduces context switching and speeds up
 iteration.


### Step: Draft your prompt with intent
Start in your notes or a Google Doc. Write a short, focused prompt that
describes the core user journey, key screens, and any visual preferences.
Keep it specific and concise.

### Step: Set up your workspace
Arrange two windows side by side. Left: Vercel V0 for UI generation. Right:
your LLM and notes for refining the prompt and searching documentation.

### Step: Generate the first UI in V0
Paste your prompt into V0 and generate an initial interface. Review the
output carefully: layout, component structure, naming, and accessibility.

### Step: Iterate with fast feedback loops
Identify issues or gaps, refine your prompt, and regenerate targeted parts
(not always the entire UI). Repeat until the flow matches your intent.

### Step: Export when satisfied
When the interface feels right, download the code from V0. You’ll wire up
functionality and any onchain features later in your local environment.

## Example: Frontend-Only Prompt Template

Use (and adapt) this prompt to have V0 generate a clean starting interface for your Mini App. Keep it UI-first—no wallet hooks or chain calls yet.```I’m designing the first version of a Mini App UI. Please generate React + TypeScript components with Tailwind CSS that focus on layout and flow only (no data fetching, no blockchain code).

## GOAL
- A simple interface that lets users complete a primary task in under 3 taps/clicks.

## SCREENS

- Home: brief header, primary call to action, and a simple list/grid of recent items.
- Create: a form with 2–3 inputs and a prominent submit button.
- Activity: a read-only feed/timeline showing recent actions in clean cards.

## COMPONENTS

- Reusable Button, Input, Card, and EmptyState components.
- A top-level Layout with responsive header and mobile navigation.

## UX & STYLE

- Mobile-first, accessible, keyboard-friendly.
- Clear hierarchy, generous spacing, and concise copy.
- Subtle loading states and disabled states for buttons.

## DELIVERABLES

- A small component tree with sensible file names.
- Minimal state management with placeholder handlers.
- Inline comments describing where to wire real logic later.

Return complete, working code and explain key decisions briefly at the top of the file.```# Make Your Web App a Mini App

> Convert your downloaded frontend into a Mini App by integrating MiniKit, Smart Wallet, and Paymaster

# Add MiniKit to Your App

You have a clean frontend. Now turn it into a Mini App. Vibe coding tools are great for UI, but they do not yet handle onchain pieces perfectly. Download your code, open it in Cursor or Claude Code, and add MiniKit to enable Smart Wallet, gasless transactions, and Base App integration.


> Note:
Before you prompt your AI IDE, list where you want onchain interactions to
 happen. Examples: mint a collectible from the Create screen, tip from the
 Feed, swap on the Trade screen. This helps the AI place MiniKit components in
 the right files.


### Step: Open your project in an AI IDE
Launch Cursor or Claude Code and open your Next.js project. Ensure it runs
locally first with <code>npm run dev</code> so the AI can follow a working
baseline.

### Step: Provide docs context to the AI
Use the MiniKit existing-app integration page. Use the site dropdown to
“Copy page as Markdown for LLMs”, then paste that markdown into your AI IDE
as context.

### Step: Ask the AI to analyze your app
Have the AI map your routes, layout, and component structure. Ask it to
propose exact integration points for MiniKit provider and hooks.

### Step: Integrate MiniKit provider and Smart Wallet
Add the MiniKit provider in <code>app/layout.tsx</code> (or your top-level
layout), wire basic hooks, and confirm no “login” button is added. Mini Apps
should feel native and sessionless.

### Step: Add Paymaster for gasless UX
Configure Coinbase Developer Platform Paymaster with environment variables.
Update your action flows to sponsor transactions, then test locally.

### Step: Verify and commit
Run your app, test every onchain touchpoint, and commit changes with clear
messages. You are ready to deploy.

## Helpful Prompts:


> Note:
**Shortcut:** On any of the Base docs pages, use the dropdown to “Copy page as
 Markdown for LLMs” and paste it directly into your AI chat. This gives the
 model precise instructions and reduces hallucinations.

<Accordion title="Prompt: Converting Existing Applications to Mini Apps">```Guide me through converting my existing web application into a Mini App:

 EXISTING APP ANALYSIS:

 My app is built with [DESCRIBE YOUR TECH STACK]

 Current features include: [LIST MAIN FEATURES]

 User authentication currently uses: [DESCRIBE AUTH METHOD]

 Data is stored using: [DESCRIBE DATA STORAGE]

 INTEGRATION REQUIREMENTS:

 Add MiniKit provider and Smart Wallet in app/layout.tsx

 Integrate Coinbase Paymaster for gasless transactions

 Place onchain actions on these screens: [LIST SCREENS]

 Configure env vars for Base and CDP

 Avoid adding any login button

 DEPLOYMENT CONFIGURATION:

 Prepare .env.local for local and Vercel for production

 Deploy with Vercel CLI

 Test Base App integration flows

 TROUBLESHOOTING SETUP:

 Log wallet and sponsorship states

 Add clear error toasts

 Provide rollbacks for provider or env misconfig

 Provide step-by-step instructions with exact code changes and file paths. Include troubleshooting tips for common conversion issues.```</Accordion>

<Accordion title="Prompt: AI Analysis Prompt (for Cursor or Claude Code)">
 Paste this into your AI IDE. Replace bracketed parts with your details. Include the MiniKit “existing app integration” markdown from docs.base.org as an additional message.```You are assisting me in converting a downloaded Next.js app into a Mini App for the Base App (TBA).

 ANALYZE THE PROJECT

 Inspect my Next.js structure (app/, components/, utils/) and identify the best integration points for:

 MiniKit provider in app/layout.tsx

 Smart Wallet setup

 Any hooks needed to access Base App context

 List every file you plan to modify and why.

 INTEGRATION REQUIREMENTS

 Use MiniKit as per the docs I will paste.

 Use Coinbase Developer Platform (CDP) Paymaster for gasless transactions.

 Use Smart Wallet.

 Do NOT create a login button.

 Keep the current routing and UI intact.

 ONCHAIN TOUCHPOINTS IN MY APP

 I want onchain interactions in these places:
 [Describe screens and actions, e.g., Create screen: mint item; Feed: tip creator; Trade: swap token]

 IMPLEMENTATION PLAN

 Propose exact code changes with file paths and code blocks.

 - Add required env vars and tell me where to put them (.env.local).
 - Update any server actions or API routes needed to call Paymaster safely.

 VALIDATION

 Provide a test checklist to verify:
 - Provider mounts without errors
 - Smart Wallet available

 Paymaster sponsoring a sample transaction

 No login button rendered

 Include troubleshooting tips for common issues (env vars, build errors, missing providers).

 Now request any files you need to see to proceed, and confirm assumptions before editing.```</Accordion>



# Fork and Customize (Optional)

> Learn how to fork a reference Mini App, customize it with your own flows and branding, and deploy it to production

## Fork, Customize and Deploy

Forking a reference Mini App can save time, then you can layer in your specific flows and branding.


### Step: Fork a relevant starter
Choose an example close to your use case. Update the`/.well-known/farcaster.json`file, metadata in`app/layout.tsx`and
environment variables.

### Step: Customize UI and contracts
Adjust theme tokens, copy, and any contract addresses or endpoints required
for your flows.

### Step: Deploy and verify in Base App
Deploy with Vercel, test sharing and discovery, and validate wallet and
Paymaster flows end to end.

To fork a reference Mini App, open your terminal and run the following command:
#### Command```bash
git clone https://github.com/base/demos.git
cd demos/minikit/three-card-monte
npm install
npm run dev
```<Accordion title="Prompt: Forking and Customizing Mini Apps">```Help me fork and customize an existing Mini App for my specific needs:

 PROJECT REQUIREMENTS:

 I want to build: [DESCRIBE YOUR MINI APP IDEA]

 Target audience: [DESCRIBE YOUR USERS]

 Key differentiators: [WHAT MAKES YOUR APP UNIQUE]

 Branding requirements: [COLORS, STYLE, MESSAGING]

 CUSTOMIZATION TASKS:

 Fork appropriate Base Mini App repository

 Update miniapp.config.json metadata

 Customize theme and copy

 Configure contract addresses and env vars

 DEPLOYMENT PROCESS:

 Deploy with Vercel

 Set custom domain if needed

 Test Mini App behavior within Base App

 VERIFICATION CHECKLIST:

 Social sharing displays correctly

 Smart Wallet and gasless flows work

 All custom features function as expected

 Provide a file-by-file checklist, exact commands, and a short troubleshooting section.```</Accordion>



Add MiniKit to Your App

# Install

> Add MiniKit to an existing Next.js app

Install MiniKit (part of OnchainKit) into your existing Next.js App Router project.

## Prerequisites

<AccordionGroup>
 <Accordion title="Next.js App Router">
Your project uses the`app/`directory (App Router).
 </Accordion>

 <Accordion title="Deployment">
Your app is deployed and publicly accessible over HTTPS (e.g., Vercel).
 </Accordion>

 <Accordion title="Farcaster account">
You have access to your Farcaster custody wallet for manifest signing.
 </Accordion>

 <Accordion title="CDP account (for API key)">
Sign in to Coinbase Developer Platform to get a Client API key.
 </Accordion>
</AccordionGroup>

## Install dependencies
#### Command```bash
npm install @coinbase/onchainkit
```<Check>
 Verify`@coinbase/onchainkit`appears in your`package.json`.
</Check>


# Add MiniKit

> Wrap your app with MiniKitProvider and initialize the frame

Add the provider and initialize MiniKit in your main page.

## Add MiniKitProvider

Create `providers/MiniKitProvider.tsx`and wrap`app/layout.tsx`.
#### Code
```jsx
'use client';
import { MiniKitProvider } from '@coinbase/onchainkit/minikit';
import { ReactNode } from 'react';
import { base } from 'wagmi/chains';

export function MiniKitContextProvider({ children }: { children: ReactNode }) {
 return (
 <MiniKitProvider apiKey={process.env.NEXT_PUBLIC_CDP_CLIENT_API_KEY} chain={base}>
 {children}
 </MiniKitProvider>
 );
}
```Wrap your root layout:
#### Code```jsx
import { MiniKitContextProvider } from '@/providers/MiniKitProvider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
 return (
 <html lang='en'>
 <body>
 <MiniKitContextProvider>{children}</MiniKitContextProvider>
 </body>
 </html>
 );
}
```## Initialize MiniKit in your page

Use`useMiniKit`to call`setFrameReady`when your app is ready.
#### Code```jsx
'use client';
import { useEffect } from 'react';
import { useMiniKit } from '@coinbase/onchainkit/minikit';

export default function HomePage {
 const { setFrameReady, isFrameReady } = useMiniKit;

 useEffect( => {
 if (!isFrameReady) setFrameReady;
 }, [isFrameReady, setFrameReady]);

 return <div>Your app content goes here</div>;
}
```> Note:
The provider configures wagmi and react‑query and uses the Farcaster connector when available.

# Configure Environment

> Add required and optional environment variables for MiniKit

Add required variables to your local and deployment environments.

<Tabs>
 <Tab title="Required Variables">
These variables are essential for your MiniKit app to function:

<ParamField path="NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME" type="string" required>
 The name of your Mini App as it appears to users
</ParamField>

<ParamField path="NEXT_PUBLIC_URL" type="string" required>
 The deployed URL of your application (must be HTTPS)
</ParamField>

<ParamField path="NEXT_PUBLIC_ONCHAINKIT_API_KEY" type="string" required>
 Your Coinbase Developer Platform API key
</ParamField>

<ParamField path="FARCASTER_HEADER" type="string" required>
 Generated during manifest creation for account association
</ParamField>

<ParamField path="FARCASTER_PAYLOAD" type="string" required>
 Generated during manifest creation for account association
</ParamField>

<ParamField path="FARCASTER_SIGNATURE" type="string" required>
 Generated during manifest creation for account association
</ParamField>
 </Tab>

 <Tab title="Optional Variables">
These variables enhance your app's appearance and metadata:

<ParamField path="NEXT_PUBLIC_APP_ICON" type="string">
 URL to your app's icon (recommended: 48x48px PNG)
</ParamField>

<ParamField path="NEXT_PUBLIC_APP_SUBTITLE" type="string">
 Brief subtitle shown in app listings
</ParamField>

<ParamField path="NEXT_PUBLIC_APP_DESCRIPTION" type="string">
 Detailed description of your app's functionality
</ParamField>

<ParamField path="NEXT_PUBLIC_APP_SPLASH_IMAGE" type="string">
 URL to splash screen image shown during app loading
</ParamField>

<ParamField path="NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR" type="string">
 Hex color code for splash screen background (e.g., "#000000")
</ParamField>

<ParamField path="NEXT_PUBLIC_APP_PRIMARY_CATEGORY" type="string">
 Primary category for app discovery (e.g., "social", "gaming", "utility")
</ParamField>

<ParamField path="NEXT_PUBLIC_APP_HERO_IMAGE" type="string">
 Hero image URL displayed in cast previews
</ParamField>

<ParamField path="NEXT_PUBLIC_APP_TAGLINE" type="string">
 Short, compelling tagline for your app
</ParamField>

<ParamField path="NEXT_PUBLIC_APP_OG_TITLE" type="string">
 Open Graph title for social sharing
</ParamField>

<ParamField path="NEXT_PUBLIC_APP_OG_DESCRIPTION" type="string">
 Open Graph description for social sharing
</ParamField>

<ParamField path="NEXT_PUBLIC_APP_OG_IMAGE" type="string">
 Open Graph image URL for social media previews
</ParamField>
 </Tab>
</Tabs>

### Copy-paste .env example
#### Command```bash
# Required
NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME=YourAppName
NEXT_PUBLIC_URL=https://your-app.vercel.app
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_cdp_client_api_key

# Generated by `npx create-onchain --manifest`FARCASTER_HEADER=base64_header
FARCASTER_PAYLOAD=base64_payload
FARCASTER_SIGNATURE=hex_signature

# Optional (appearance and metadata)
NEXT_PUBLIC_APP_ICON=https://your-app.vercel.app/icon.png
NEXT_PUBLIC_APP_SUBTITLE=Short subtitle
NEXT_PUBLIC_APP_DESCRIPTION=Describe what your app does
NEXT_PUBLIC_APP_SPLASH_IMAGE=https://your-app.vercel.app/splash.png
NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR=#000000
NEXT_PUBLIC_APP_PRIMARY_CATEGORY=social
NEXT_PUBLIC_APP_HERO_IMAGE=https://your-app.vercel.app/og.png
NEXT_PUBLIC_APP_TAGLINE=Play instantly
NEXT_PUBLIC_APP_OG_TITLE=Your App
NEXT_PUBLIC_APP_OG_DESCRIPTION=Fast, fun, social
NEXT_PUBLIC_APP_OG_IMAGE=https://your-app.vercel.app/og.png```> Warning:
Ensure all referenced assets are publicly accessible via HTTPS.

# Manifest (CLI)

> Generate account association credentials with the CLI

Generate your Farcaster account association credentials.
#### Command```bash
npx create-onchain --manifest
```Follow the prompts to connect your Farcaster custody wallet, add your deployed URL, and sign. The CLI writes`FARCASTER_HEADER`, `FARCASTER_PAYLOAD`, and `FARCASTER_SIGNATURE`to your`.env`.


> Warning:
While testing, set `noindex: true`in your manifest to avoid indexing.

# Create Manifest

> Expose the required /.well-known/farcaster.json endpoint

Your Mini App's Manifest proves ownership of your app and powers search, discovery, and rich embeds in the Base App.

Below we'll create a Next.js route at`app/.well-known/farcaster.json/route.ts`that returns your accountAssociation and frame metadata.

<Check>
 Visit`https://yourdomain.com/.well-known/farcaster.json`to verify JSON output.
</Check>
#### Code```ts
function withValidProperties(properties: Record<string, undefined | string | string[]>) {
 return Object.fromEntries(
 Object.entries(properties).filter(([_, value]) => (Array.isArray(value) ? value.length > 0 : !!value))
 );
}

export async function GET {
 const URL = process.env.NEXT_PUBLIC_URL as string;
 return Response.json({
 accountAssociation: {
 header: process.env.FARCASTER_HEADER,
 payload: process.env.FARCASTER_PAYLOAD,
 signature: process.env.FARCASTER_SIGNATURE,
 },
 frame: withValidProperties({
 version: '1',
 name: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME,
 subtitle: process.env.NEXT_PUBLIC_APP_SUBTITLE,
 description: process.env.NEXT_PUBLIC_APP_DESCRIPTION,
 screenshotUrls: [],
 iconUrl: process.env.NEXT_PUBLIC_APP_ICON,
 splashImageUrl: process.env.NEXT_PUBLIC_APP_SPLASH_IMAGE,
 splashBackgroundColor: process.env.NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR,
 homeUrl: URL,
 webhookUrl: `${URL}/api/webhook`,
 primaryCategory: process.env.NEXT_PUBLIC_APP_PRIMARY_CATEGORY,
 tags: [],
 heroImageUrl: process.env.NEXT_PUBLIC_APP_HERO_IMAGE,
 tagline: process.env.NEXT_PUBLIC_APP_TAGLINE,
 ogTitle: process.env.NEXT_PUBLIC_APP_OG_TITLE,
 ogDescription: process.env.NEXT_PUBLIC_APP_OG_DESCRIPTION,
 ogImageUrl: process.env.NEXT_PUBLIC_APP_OG_IMAGE,
 // use only while testing
 noindex: true,
 }),
 });
}
```Review the full [Manifest guide](/mini-apps/features/manifest) and update all fields. Be sure to update your deployment environment with these values.


# Add Frame Metadata

> Define fc:frame metadata to render rich embeds with launch buttons

Metadata is critical for your app to be discovered. It enables rich embeds shared in the social feed and allows it to be properly indexed.Add`fc:frame`metadata so shared links render an embed with a launch button.

<Frame caption="Metadata enables rich embeds and discovery">
 ![](https://mintcdn.com/base-a060aa97/gS084HRa38b8UMsN/images/minikit/social_finding.gif?s=c0354f6297ab0447101d9d2d11ef9f5c)
> Warning:
Place the meta tag in`<head>`and ensure all referenced assets use HTTPS.

### Next.js (generateMetadata)
#### Code```ts
export async function generateMetadata: Promise<Metadata> {
 const URL = process.env.NEXT_PUBLIC_URL as string;
 return {
 title: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME,
 description: 'Generated by `create-onchain --mini`',
 other: {
 'fc:frame': JSON.stringify({
 version: 'next',
 imageUrl: process.env.NEXT_PUBLIC_APP_HERO_IMAGE,
 button: {
 title: `Launch ${process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME}`,
 action: {
 type: 'launch_frame',
 name: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME,
 url: URL,
 splashImageUrl: process.env.NEXT_PUBLIC_SPLASH_IMAGE,
 splashBackgroundColor: process.env.NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR,
 },
 },
 }),
 },
 };
}
```# Test & Deploy

> Validate your manifest and embed configuration, then share

Before sharing your Mini App, validate everything works.

## Pre‑deployment checklist

* App is deployed at a public HTTPS domain
* Environment variables are set on your deployment platform
*`/.well-known/farcaster.json`returns valid JSON
*`fc:frame`metadata renders a launch button when shared

## Validation Tools

[Base Build](https://base.dev) is the place to test and validate your Mini App. In addition to tracking your app’s usage and redeeming builder rewards, it includes a **Preview tool**, which helps you:

* Validate your app's manifest and metadata
* Test how your app will appear in the Base app
* Verify ownership and account association

The Preview tool provides clear visual cues:

* ✅ Green check marks when things are set up correctly
* ❌ Red indicators when something needs your attention

### Components of the Preview Tool

The Preview tool has three main components:

* **Console**: Preview your app and review logs to make informed decisions about performance.
* **Account Association**: Confirm your app is linked to the correct account, signatures are valid, and the domain matches what’s specified in the manifest.
* **Metadata**: Ensure your Mini App renders exactly as expected by verifying required fields like name, icon, tags, and splash image.

### Getting Started

1. [Import your app](https://docs.base.org/mini-apps/growth/data-driven-growth) into Base Build
2. Visit the [Preview tool](https://base.dev/preview) to begin validating your app

## Share and test

1. Create a cast with your app’s URL
2. Verify preview and launch button
3. Test launch and frame readiness



- [Launch Checklist](/mini-apps/quickstart/launch-checklist)



- [Troubleshooting](/mini-apps/troubleshooting/common-issues)








LEARN

Onchain App Development

Frontend Setup

# Building an Onchain App

> Learn step-by-step how to turn a regular template app into an onchain app with a wallet connection.

export const Danger = ({children}) => {
 return <div class="my-4 px-5 py-4 overflow-hidden rounded-2xl flex gap-3 border danger-admonition dark:danger-admonition">
 <div class="mt-0.5 w-4">
<svg width="14" height="14" viewBox="0 0 14 14" fill="rgb(239, 68, 68)" xmlns="http://www.w3.org/2000/svg class="w-4 h-4 text-sky-500" aria-label="Danger">
 <path fill-rule="evenodd" clip-rule="evenodd" d="M7 1.3C10.14 1.3 12.7 3.86 12.7 7C12.7 10.14 10.14 12.7 7 12.7C5.48908 12.6974 4.0408 12.096 2.97241 11.0276C1.90403 9.9592 1.30264 8.51092 1.3 7C1.3 3.86 3.86 1.3 7 1.3ZM7 0C3.14 0 0 3.14 0 7C0 10.86 3.14 14 7 14C10.86 14 14 10.86 14 7C14 3.14 10.86 0 7 0ZM8 3H6V8H8V3ZM8 9H6V11H8V9Z"></path>
</svg>
 </div>
 <div class="text-sm prose min-w-0">
{children}
 </div>
</div>;
};





#### Ek Varyant 2



While it's convenient and fast to start from a template, the template may not fit your needs. Whether you prefer a different stack, or have already started building the traditional web components of your app, it's common to need to manually add onchain libraries to get your app working.

In this guide, you'll build the beginnings of an app similar to the one created by the [RainbowKit] quick start, but you'll do it piece by piece. You can follow along, and swap out any of our library choices with the ones you prefer.

***

## Objectives

By the end of this guide you should be able to:

* Identify the role of a wallet aggregator in an onchain app
* Debate the pros and cons of using a template
* Add a wallet connection to a standard template app

***

## Creating the Traditional App

Start by running the [Next.js] script to create a Next.js app:
#### Command```bash
npx create-next-app@latest --use-yarn
```This script will accept`.`, if you want to add the project to the root of a folder you've already created. Otherwise, name your project. Select each option in the generation script as you see fit. We recommend the following selections:

* Use Typescript?: Yes
* Use ESLint?: Yes
* Use Tailwind?: Your preference
* Use `src/`directory?: Yes
* Use App Router?: Yes
* Customize the default import alias?: No

<Note>
 The default Next.js script installs [Tailwind]. [RainbowKit]'s does not.
</Note>

Run your app with`yarn dev`to make sure it generated correctly.

### Manually Installing RainbowKit, Wagmi, and Viem

The [quick start] guide for RainbowKit also contains step-by-step instructions for manual install. You'll be following an adjusted version here. Most of the setup is actually for configuring [wagmi], which sits on top of [viem] and makes it much easier to write React that interacts with the blockchain.

Start by installing the dependencies:
#### Command```bash
npm install @rainbow-me/rainbowkit wagmi viem@2.x @tanstack/react-query
```<Note>
 Onchain libraries and packages tend to require very current versions of Node. If you're not already using it, you may want to install [nvm].
</Note>

## Adding Imports, Connectors, Config

In Next.js with the app router, the root of your app is found in`app/layout.tsx`, if you followed the recommended setup options. As you want the blockchain provider context to be available for the entire app, you'll add it here.

You'll need to set up your providers in a second file, so that you can add `'use client';`to the top. Doing so forces this code to be run client side, which is necessary since your server won't have access to your users' wallet information.


> Warning:
You must configure these wrappers in a separate file. It will not work if you try to add them and`'use client';`directly in`layout.tsx`!

Add a new file in the `app`folder called`providers.tsx`.

### Imports

As discussed above, add `'use client';`to the top of the file.

Continue with the imports:
#### Code```tsx
import '@rainbow-me/rainbowkit/styles.css';
import { useState, type ReactNode } from 'react';
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
```> Warning:
If you're adapting this guide to a different set of libraries or platforms, you may need to import`styles.css`differently. You'll know this is the case if you get ugly text at the bottom of the page instead of a nice modal when you click the connect button.

### Config

Now, you need to configure the chains, wallet connectors, and providers for your app. You'll use`getDefaultConfig`for now, to get started. See our guide on [Connecting to the Blockchain] for more information on blockchain providers.

<Note>
 To take advantage of a more advanced set of options with [OnchainKit], see our tutorial on how to [Use the Coinbase Smart Wallet and EOAs with OnchainKit]. If you just want to customize the list of wallets in [RainbowKit], see our tutorial for [Coinbase Smart Wallet with RainbowKit].
</Note>

You'll need a`projectId`from [Wallet Connect Cloud], which you can get for free on their site. Make sure to insert it in the appropriate place.

<Danger>
 Remember, everything on the frontend is public! Be sure to configure the allowlist for your WalletConnect id!
</Danger>
#### Code```tsx
const config = getDefaultConfig({
 appName: 'Cool Onchain App',
 projectId: 'YOUR_PROJECT_ID',
 chains: [base, baseSepolia],
 ssr: true, // If your dApp uses server side rendering (SSR)
});
```### Returning the Context Providers

[TanStack Query] is now a required dependency for wagmi, and you need to add it as a React context provider. The short version is that it helps with state management. Read the docs for the long version!

Add an exported function for the providers. This sets up the`QueryClient`and returns`props.children`wrapped in all of your providers.
#### Code```tsx
export function Providers(props: { children: ReactNode }) {
 const [queryClient] = useState( => new QueryClient);

 return (
 <WagmiProvider config={config}>
 <QueryClientProvider client={queryClient}>
 <RainbowKitProvider>{props.children}</RainbowKitProvider>
 </QueryClientProvider>
 </WagmiProvider>
 );
}
```## Using Your new Providers

Open`layout.tsx`. Import your `Providers`, being careful if you use auto-import as there are many other things with similar names in the list. Wrap the `children`in your`return`with the new`Providers`.
#### Code
```tsx
return (
 <html lang="en">
 <body className={inter.className}>
 <Providers>{children}</Providers>
 </body>
 </html>
);
```## Adding the Connect Button

You're now ready to add your connect button. You can do this anywhere in your app, thanks to the`RainbowKitProvider`. Common practice would be to place the button in your app's header. Since the Next.js template doesn't have one, you can just add it to the top of the automatically generated page, rather than spending time implementing React components.

Open up `page.tsx`, and import the `ConnectButton`:
#### Code
```tsx
import { ConnectButton } from '@rainbow-me/rainbowkit';
```Then, simply add the`ConnectButton`component at the top of the first`<div>`:
#### Code
```tsx
// This function has been simplified to save space.
export default function Home {
 return (
 <main className="flex min-h-screen flex-col items-center justify-between p-24">
 <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
 <ConnectButton />

 {/* Other Code...*/}
 </p>
 </div>
 </main>
 );
}
```Run your app with`yarn dev`, and you should be able to use the RainbowKit connect button to connect with your wallet and switch between networks.

You use the [Connect Button] props to modify its properties, or you can [customize the connect button] extensively. Some users dislike having the connect button display their token balance. Try disabling it with:
#### Code
```tsx
<ConnectButton showBalance={false} />
```***

## Conclusion

In this guide, you've learned how to assemble your onchain app from several pieces. You can use this knowledge to integrate a wallet connection with an existing site, or adjust the stack to meet your preferences. Finally, you've learned how to insert and customize the connect button.

If you're looking to quickly bootstrap a simple app, you can always use a script, such as the RainbowKit [quick start]. If you're looking for a robust start for a consumer application, check out [OnchainKit]!

***

[RainbowKit]: https://www.rainbowkit.com/

[wagmi]: https://wagmi.sh/

[viem]: https://viem.sh/

[quick start]: https://www.rainbowkit.com/docs/installation

[Next.js]: https://nextjs.org/

[Tailwind]: https://tailwindcss.com/

[nvm]: https://github.com/nvm-sh/nvm

[WalletConnect]: https://cloud.walletconnect.com/

[Connecting to the Blockchain]: https://docs.base.org/connecting-to-the-blockchain/overview

[Wallet Connect Cloud]: https://cloud.walletconnect.com/

[Connect Button]: https://www.rainbowkit.com/docs/connect-button

[customize the connect button]: https://www.rainbowkit.com/docs/custom-connect-button

[TanStack Query]: https://tanstack.com/query/latest

[Coinbase Smart Wallet with RainbowKit]: https://docs.base.org/base-account/framework-integrations/rainbowkit

[OnchainKit]: https://onchainkit.xyz/?utm_source=basedocs&utm_medium=tutorials&campaign=building-an-onchain-app

[Use the Coinbase Smart Wallet and EOAs with OnchainKit]: https://docs.base.org/tutorials/smart-wallet-and-eoa-with-onchainkit



# Wallet Connectors

> Learn about how wallet connector libraries aggregate wallets and make it easier to connect to them from your app.





#### Ek Varyant 2



One of the most intimidating tasks when building an onchain app is making that initial connection between your users' wallets, and your app. Initial research often surfaces a bewildering number of wallets, each with their own SDKs, and own methods to manage the connection. Luckily, you don't actually need to manage all of this on your own. There are a number of wallet connector libraries specialized in creating a smooth and beautiful user experience to facilitate this connection.

To further add to the confusion and difficulty, [Smart wallets] are growing in popularity. These advanced wallets allow users to create and manage wallets with [passkeys], and support, or will soon support, a growing array of features including session keys, account recovery, and more!

[RainbowKit], the aggregator you'll use for this lesson, works with the Coinbase Smart Wallet out of the box, but you'll need to do a little bit of extra configuration to support users of both traditional wallets and smart wallets.

***

## Objectives

By the end of this guide you should be able to:

* Identify the role of a wallet aggregator in an onchain app
* Debate the pros and cons of using a template
* Scaffold a new onchain app with RainbowKit
* Support users of EOAs and the Coinbase Smart Wallet with the same app

***

## Connecting to the Blockchain

One of the many challenging tasks of building a frontend that can interface with your smart contracts is managing the user's connection between your onchain app and their \[EOA] wallet. Not only is there an ever-growing suite of different wallets, but users can (and probably should!) use several different addresses within the same wallet app.

[Rainbowkit] is one of several options that makes this a little bit easier by serving as an aggregator of wallets, and handling some of the details of connecting them. Alternatives include [ConnectKit], and [Dynamic], which are both excellent choices as well.

Each of these include customizable UI/UX components for inviting the user to connect, displaying connection status, and selecting which wallet they wish to use.

### Using the Quick Start

If you're just trying to get up and running as quickly as possible, you can use RainbowKit's [quick start] script to scaffold an app from their template, with a single command. If you're using Yarn:
#### Command```bash
yarn create @rainbow-me/rainbowkit
```<Note>
 The script doesn't accept`.`as a project name, so you'll want to run this script in your`src`directory, or wherever you keep your projects. It will create a folder with the same name as your project, and install the project files inside.
</Note>

Once it's done, simply run the app with:
#### Command```bash
yarn run dev
```Using the script is fast, but it does mean less choice. In this case, it builds the app on top of [Next.js], which is great if you want to use it, but not helpful if you prefer to work from a different framework, such as [Create React App], or [Remix] (the React framework, not the Solidity IDE). The script also doesn't help you if you want to add an onchain integration to an existing site.

<Note>
 The Rainbowkit template has been updated to wagmi 2.X, but it does **not** use the Next.js app router. You'll need to install it manually if you wish to use the latest patterns.

 The [Building an Onchain App] tutorial will show you how to do this!
</Note>

### Coinbase Smart Wallet

If you have the Coinbase Wallet extension, you might be wondering where the smart wallet can be found. By default, the smart wallet will only be invoked if you click the`Coinbase Wallet`button to log in **and** you **don't** have the browser extension. To test, open a private window with extensions disabled and try to log in.

Selecting`Rainbow`, `MetaMask`, or `WalletConnect`will display a QR code so that the user can log in with their phone. Picking`Coinbase Wallet`will instead invoke the smart wallet login.

This flow can be improved upon, as new crypto users won't know that digging for the smart wallet is the best path forward, and existing users who are trying to migrate to the smart wallet don't have that option.

See our tutorial on how to [Use the Coinbase Smart Wallet and EOAs with OnchainKit] for more details!

***

## Conclusion

In this article, you've learned how libraries such as [Rainbowkit], [ConnectKit], and [Dynamic], aggregate wallets and make it easier for you to connect your app to your users' wallet of choice. You've also learned how you can use a template to quickly create the foundation of your app. Finally, you've learned that the cost of using a template is that it does make some choices for you.

***

[RainbowKit]: https://www.rainbowkit.com/

[wagmi]: https://wagmi.sh/

[wallet]: https://ethereum.org/en/developers/docs/accounts/

[ConnectKit]: https://ethereum.org/en/developers/docs/accounts/

[Dynamic]: https://www.dynamic.xyz/

[quick start]: https://www.rainbowkit.com/docs/installation

[Next.js]: https://nextjs.org/

[Create React App]: https://create-react-app.dev/

[Remix]: https://remix.run/

[Building an Onchain App]: ./building-an-onchain-app

[Smart wallets]: https://www.coinbase.com/wallet/smart-wallet

[passkeys]: https://safety.google/authentication/passkey/

[Use the Coinbase Smart Wallet and EOAs with OnchainKit]: https://docs.base.org/tutorials/smart-wallet-and-eoa-with-onchainkit



# Introduction to Providers

> A tutorial that teaches what providers are, why you need one, and how to configure several providers and use them to connect to the blockchain.





#### Ek Varyant 2



This tutorial provides an introduction to providers and shows you how to connect your frontend to the blockchain using JSON RPC blockchain providers, and the \[RainbowKit], \[wagmi], and \[viem] stack.

## Objectives

By the end of this tutorial, you should be able to:

* Compare and contrast public providers vs. vendor providers vs. wallet providers
* Select the appropriate provider for several use cases
* Set up a provider in wagmi and use it to connect a wallet
* Protect API keys that will be exposed to the front end

## Prerequisites

### 1. Be familiar with modern, frontend web development

In this tutorial, we'll be working with a React frontend built with \[Next.js]. While you don't need to be an expert, we'll assume that you're comfortable with the basics.

### 2. Possess a general understanding of the EVM and smart contract development

This tutorial assumes that you're reasonably comfortable writing basic smart contracts. If you're just getting started, jump over to our \[Base Learn] guides and start learning!

## Types of Providers

Onchain apps need frontends, sometimes called dApps, to enable your users to interact with your smart contracts. A *provider* makes the connection from frontend to the blockchain, and is used to read data and send transactions.

In blockchain development, the term *provider* describes a company or service that provides an API enabling access to the blockchain as a service. This is distinct from the providers you wrap your app in using the \[React Context API], though you'll use one of those to pass your blockchain provider deeply into your app.

These services enable interacting with smart contracts without the developer needing to run and maintain their own blockchain node. Running a node is expensive, complicated, and challenging. In most cases, you'll want to start out with a provider. Once you start to get traction, you can evaluate the need to \[run your own node], or switch to a more advanced architecture solution, such as utilizing \[Subgraph].

Figuring out which type of provider to use can be a little confusing at first. As with everything blockchain, the landscape changes rapidly, and search results often return out-of-date information.

<Info>
 New onchain devs sometimes get the impression that there are free options for connecting their apps to the blockchain. Unfortunately, this is not really true. Blockchain data is still 1's and 0's, fetched by computation and served to the internet via servers.

 It costs money to run these, and you will eventually need to pay for the service.
</Info>

You'll encounter providers divided into three general categories: Public Providers, Wallet Providers, and Vendor Providers

### Public Providers

Many tutorials and guides, including the getting started guide for \[wagmi], use a *Public Provider* as the default to get you up and running. Public means that they're open, permissionless, and free, so the guides will also usually warn you that you need to add another provider if you don't want to run into rate limiting. Listen to these warnings! The rate-limits of public providers are severe, and you'll start getting limited very quickly.

In wagmi, a public client is automatically included in the default config. This client is just a wrapper setting up a \[JSON RPC] provider using the`chain`and`rpcUrls`listed in Viem's directory of chain information. You can view the \[data for Base Sepolia here].

Most chains will list this information in their docs as well. For example, on the network information pages for \[Base] and \[Optimism]. If you wanted, you could manually set up a`jsonRpcProvider`in wagmi using this information.

### Wallet Providers

Many wallets, including Coinbase Wallet and MetaMask, inject an Ethereum provider into the browser, as defined in \[EIP-1193]. The injected provider is accessible via`window.ethereum`.

Under the hood, these are also just JSON RPC providers. Similar to public providers, they are rate-limited.

Older tutorials for early libraries tended to suggest using this method for getting started, so you'll probably encounter references to it. However, it's fallen out of favor, and you'll want to use the public provider for your initial connection experiments.

### Vendor Providers

A growing number of vendors provide access to blockchain nodes as a service. Visiting the landing pages for \[QuickNode], \[Alchemy], or \[Coinbase Developer Platform (CDP)] can be a little confusing. Each of these vendors provides a wide variety of services, SDKs, and information.

Luckily, you can skip most of this if you're just trying to get your frontend connected to your smart contracts. You'll just need to sign up for an account, and get an endpoint, or a key, and configure your app to connect to the provider(s) you choose.

It is worth digging in to get a better understanding of how these providers charge you for their services. The table below summarizes some of the more important API methods, and how you are charged for them by each of the above providers.

Note that the information below may change, and varies by network. Each provider also has different incentives, discounts, and fees for each level of product. They also have different allowances for calls per second, protocols, and number of endpoints. Please check the source to confirm!

| | \[Alchemy Costs] | \[QuickNode Costs] | \[CDP Costs] |
| :--------------- | :--------------- | :----------------- | :----------------- |
| Free Tier / Mo. | 3M compute units | 50M credits | 500M billing units |
| Mid Tier / Mo. | 1.5B CUs @ \$199 | 3B credits @ \$299 | Coming soon |
| eth\_blocknumber | 10 | 20 | 30 |
| eth\_call | 26 | 20 | 30 |
| eth\_getlogs | 75 | 20 | 100 |
| eth\_getbalance | 19 | 20 | 30 |

To give you an idea of usage amounts, a single wagmi `useContractRead`hook set to watch for changes on a single`view`via a TanStack query and`useBlockNumber`will call`eth_blocknumber`and`eth_call`one time each, every 4 seconds.

## Connecting to the Blockchain

\[RainbowKit] is a popular library that works with \[wagmi] to make it easy to connect, disconnect, and change between multiple wallets. It's batteries-included out of the box, and allows for a great deal of customization of the list of wallets and connect/disconnect button.

You'll be using RainbowKit's \[quick start] to scaffold a new project for this tutorial. Note that at the time of writing, it does **not** use the Next.js app router. See \[Building an Onchain App] if you wish to set this up instead.

<Info>
 The script doesn't allow you to use`.`to create a project in the root of the folder you run it from, so you'll want to run it from your`src`directory, or wherever you keep your project folders.

 It will create a folder with the project name you give, and create the files inside.
</Info>

Open up a terminal and run:
#### Command```bash
yarn create @rainbow-me/rainbowkit
```Give your project a name, and wait for the script to build it. It will take a minute or two.


> Warning:
If you get an error because you are on the wrong version of node, change to the correct version then **delete everything** and run the script again.

### Scaffolded App

Open your new project in the editor of your choice, and open`pages/_app.tsx`. Here, you'll find a familiar Next.js app wrapped in \[context providers] for the TanStack QueryProvider, RainbowKit, and wagmi.
#### Code
```tsx
function MyApp({ Component, pageProps }: AppProps) {
 return (
 <WagmiProvider config={config}>
 <QueryClientProvider client={client}>
 <RainbowKitProvider>
 <Component {...pageProps} />
 </RainbowKitProvider>
 </QueryClientProvider>
 </WagmiProvider>
 );
}
```Note that these providers are using React's context feature to pass the blockchain providers and configuration into your app. It can be confusing to have the word *provider* meaning two different things in the same file, or even the same line of code!

Before you can do anything else, you need to obtain a *WalletConnect*`projectId`.

Open up the \[WalletConnect] homepage, and create an account, and/or sign in using the method of your choice.

Click the `Create`button in the upper right of the`Projects`tab.



Enter a name for your project, select the`App`option, and click`Create`.



Copy the *Project ID* from the project information page, and paste it in as the `projectId`in`getDefaultWallets`.
#### Code
```tsx
const { connectors } = getDefaultWallets({
 appName: 'RainbowKit App',
 projectId: 'YOUR_PROJECT_ID',
 chains,
});
```> Warning:
Remember, anything you put on the frontend is public! That includes this id, even if you use environment variables to better manage this type of data. Next.js reminds you of the risk, by requiring you to prepend`NEXT_PUBLIC_`to any environment variables that can be read by the browser.

 Before you deploy, make sure you configure the rest of the items in the control panel to ensure only your site can use this id.

### Public Provider

By default, the setup script will configure your app to use the built-in public provider, and connect to a number of popular chains. To simply matters, remove all but`mainnet`and`base`.
#### Code
```tsx
const config = getDefaultConfig({
 appName: 'RainbowKit App',
 projectId: 'YOUR_APP_ID_HERE',
 chains: [mainnet, base],
 ssr: true,
});
```Open the terminal and start the app with:
#### Command```bash
yarn run dev
```Click the`Connect Wallet` button, select your wallet from the modal, approve the connection, and you should see your network, token balance, and address or ENS name at the top of the screen. Select your wallet from the modal.



You've connected with the Public Provider!



### QuickNode

To select your provider(s), you'll use \[`createConfig`] instead of `getDefaultConfig`. The \[`transports`] property allows you to configure how you wish to connect with multiple networks. If you need more than one connector for a given network, you can use \[`fallbacks`].

First, set up using \[QuickNode] as your provider. Replace your import of the default config from RainbowKit with `createConfig`and`http`from wagmi:
#### Code```tsx
import { createConfig, http, WagmiProvider } from 'wagmi';
// ...Chains import
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
```You'll need an RPC URL, so open up \[QuickNode]'s site and sign up for an account if you need to. The free tier will be adequate for now, you may need to scroll down to see it. Once you're in, click`Endpoints`on the left side, then click`+ Create Endpoint`.

On the next screen, you'll be asked to select a chain. Each endpoint only works for one. Select `Base`, click `Continue`.



For now, pick `Base Mainnet`, but you'll probably want to delete this endpoint and create a new one for Sepolia when you start building. The free tier only allows you to have one at a time.

If you haven't already picked a tier, you'll be asked to do so, then you'll be taken to the endpoints page, which will display your endpoints for HTTP and WSS.


> Warning:
As with your WalletConnect Id, these endpoints will be visible on the frontend. Be sure to configure the allowlist!

Use this endpoint to add an `http` `transport`to your config:
#### Code```tsx
const config = createConfig({
 chains: [mainnet, base],
 ssr: true,
 transports: {
 [base.id]: http('YOUR PROJECT URL'),
 [mainnet.id]: http('TODO'),
 },
});
```Now, the app will use your QuickNode endpoint for the Base network. Note that you don't need an app name or WalletConnect Id, because you are no longer using WalletConnect.

To test this out, switch networks a few times. You'll know it's working if you see your balance when Base is the selected network. You haven't added mainnet, so you'll get an error in the console and no balance when you switch to that.

### Alchemy

\[Alchemy] is \[no longer baked into wagmi], but it still works the same as any other RPC provider. As with QuickNode, you'll need an account and a key. Create an account and/or sign in, navigate to the`Apps`section in the left sidebar, and click`Create new app`.



Select Base Mainnet, and give your app a name.


> Warning:
Once again, remember to configure the \[allowlist] when you publish your app, as you'll be exposing your key to the world!

# viem

> Documentation for using Viem, a TypeScript interface for EVM-compatible blockchains. This page covers installation, setup, and various functionalities such as reading and writing blockchain data and interacting with smart contracts on Base.





#### Ek Varyant 2



<Info>
 Viem is currently only available on Base Sepolia testnet.
</Info>

[viem](https://viem.sh/) a TypeScript interface for Ethereum that provides low-level stateless primitives for interacting with Ethereum.

You can use viem to interact with smart contracts deployed on Base.

## Install

To install viem run the following command:
#### Command
```bash
npm install --save viem
```## Setup

Before you can start using viem, you need to setup a [Client](https://viem.sh/docs/clients/public) with a desired [Transport](https://viem.sh/docs/clients/public) and [Chain](https://viem.sh/docs/chains/introduction)
```javascript
import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';

const client = createPublicClient({
 chain: base,
 transport: http,
});
```<Info>
 To use Base, you must specify`base`as the chain when creating a Client.

 To use Base Sepolia (testnet), replace`base`with`baseSepolia`.
</Info>

## Reading data from the blockchain

Once you have created a client, you can use it to read and access data from Base using [Public Actions](https://viem.sh/docs/actions/public/introduction)

Public Actions are client methods that map one-to-one with a "public" Ethereum RPC method (`eth_blockNumber`, `eth_getBalance`, etc.)

For example, you can use the `getBlockNumber`client method to get the latest block:```javascript
const blockNumber = await client.getBlockNumber;
````

## Writing data to the blockchain

In order to write data to Base, you need to create a Wallet client (`createWalletClient`) and specify an [`Account`](https://ethereum.org/en/developers/docs/accounts/) to use.

```javascript
import { createWalletClient, custom } from 'viem'
import { base } from 'viem/chains'

//highlight-start
const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' })
//highlight-end

const client = createWalletClient({
 //highlight-next-line
 account,
 chain: base,
 transport: custom(window.ethereum)
})

client.sendTransaction({ ... })
```

<Info>
 In addition to making a JSON-RPC request (`eth_requestAccounts`) to get an Account, viem provides various helper methods for creating an `Account`, including: [`privateKeyToAccount`](https://viem.sh/docs/accounts/local/privateKeyToAccount [`mnemonicToAccount`](https://viem.sh/docs/accounts/local/mnemonicToAccount and [`hdKeyToAccount`](https://viem.sh/docs/accounts/local/hdKeyToAccount)

To use Base Sepolia (testnet), replace `base`with`baseSepolia`.
</Info>

## Interacting with smart contracts

You can use viem to interact with a smart contract on Base by creating a `Contract` instance using [`getContract`](https://viem.sh/docs/contract/getContract) and passing it the contract ABI, contract address, and [Public](https://viem.sh/docs/clients/public) and/or [Wallet](https://viem.sh/docs/clients/wallet) Client:

````javascript
import { getContract } from 'viem';
import { wagmiAbi } from './abi';
import { publicClient } from './client';

// 1. Create contract instance
const contract = getContract({
 address: 'CONTRACT_ADDRESS',
 abi: wagmiAbi,
 publicClient,
});

// 2. Call contract methods, listen to events, etc.
const result = await contract.read.totalSupply;
```<Info>`CONTRACT_ADDRESS`is the address of the deployed contract.
</Info>


# web3.js

> Documentation for using web3.js, a JavaScript library for interacting with EVM-compatible blockchains. This page covers installation, setup, connecting to the Base network and interacting with smart contracts.





#### Ek Varyant 2



[web3.js](https://web3js.org/) is a JavaScript library that allows developers to interact with EVM-compatible blockchain networks.

You can use web3.js to interact with smart contracts deployed on the Base network.

## Install

To install web3.js run the following command:
#### Command```bash
npm install web3
```## Setup

Before you can start using web3.js, you need to import it into your project.

Add the following line of code to the top of your file to import web3.js:```javascript
//web3.js v1
const Web3 = require('web3');

//web3.js v4
const { Web3 } = require('web3');
```## Connecting to Base

You can connect to Base by instantiating a new web3.js`Web3`object with a RPC URL of the Base network:```javascript
const { Web3 } = require('web3');

const web3 = new Web3('https://mainnet.base.org;
```<Info>
 To alternatively connect to Base Sepolia (testnet), change the above URL from`https://mainnet.base.org`to`https://sepolia.base.org`.
</Info>

## Accessing data

Once you have created a provider, you can use it to read data from the Base network.

For example, you can use the `getBlockNumber`method to get the latest block:```javascript
async function getLatestBlock(address) {
 const latestBlock = await web3.eth.getBlockNumber;
 console.log(latestBlock.toString);
}
```## Deploying contracts

Before you can deploy a contract to the Base network using web3.js, you must first create an account.

You can create an account by using`web3.eth.accounts`:
```javascript
const privateKey = "PRIVATE_KEY";
const account = web3.eth.accounts.privateKeyToAccount(privateKey);
```<Info>`PRIVATE_KEY`is the private key of the wallet to use when creating the account.
</Info>

## Interacting with smart contracts

You can use web3.js to interact with a smart contract on Base by instantiating a`Contract`object using the ABI and address of a deployed contract:```javascript
const abi = [
... // ABI of deployed contract
];

const contractAddress = "CONTRACT_ADDRESS"

const contract = new web3.eth.Contract(abi, contractAddress);
```Once you have created a`Contract`object, you can use it to call desired methods on the smart contract:```javascript
async function setValue(value) {
 // write query
 const tx = await contract.methods.set(value).send;
 console.log(tx.transactionHash);
}

async function getValue {
 // read query
 const value = await contract.methods.get.call;
 console.log(value.toString);
}
````

<Info>
 For more information on deploying contracts on Base, see [Deploying a Smart Contract](../smart-contract-development/hardhat/deploy-with-hardhat.md).
</Info>

Account Abstraction

Gasless transactions with paymaster

# null

# Gasless Transactions on Base using Base Paymaster

Still trying to onboard users to your app? Want to break free from the worries of gas transactions and sponsor them for your users on Base? Look no further!

Base transaction fees are typically less than a penny, but the concept of gas can still be confusing for new users. You can abstract this away and improve your UX by using the **Base Paymaster**. The Paymaster allows you to:

- Batch multi-step transactions
- Create custom gasless experiences
- Sponsor up to \$10k monthly on mainnet (unlimited on testnet)

## Objectives

1. Configure security measures to ensure safe and reliable transactions.
2. Manage and allocate resources for sponsored transactions.
3. Subsidize transaction fees for users, enhancing the user experience by making transactions free.
4. Set up and manage sponsored transactions on various schedules, including weekly, monthly, and daily cadences.

## Prerequisites

This tutorial assumes you have:

1. **A Coinbase Cloud Developer Platform Account**\
   If not, sign up on the [CDP site]. Once you have your account, you can manage projects and utilize tools like the Paymaster.

2. **Familiarity with Smart Accounts and ERC 4337**\
   Smart Accounts are the backbone of advanced transaction patterns (e.g., bundling, sponsorship). If you’re new to ERC 4337, check out external resources like the official [EIP-4337 explainer](https://eips.ethereum.org/EIPS/eip-4337) before starting.

3. **Foundry**\
   Foundry is a development environment, testing framework, and smart contract toolkit for Ethereum. You’ll need it installed locally for generating key pairs and interacting with smart contracts.

> **Testnet vs. Mainnet**\
> If you prefer not to spend real funds, you can switch to **Base Goerli** (testnet). The steps below are conceptually the same. Just select _Base Goerli_ in the Coinbase Developer Platform instead of _Base Mainnet_, and use a contract deployed on Base testnet for your allowlisted methods.

## Set Up a Base Paymaster & Bundler

In this section, you will configure a Paymaster to sponsor payments on behalf of a specific smart contract for a specified amount.

1. **Navigate to the [Coinbase Developer Platform].**
2. Create or select your project from the upper left corner of the screen.
3. Click on the **Paymaster** tool from the left navigation.
4. Go to the **Configuration** tab and copy the **RPC URL** to your clipboard — you’ll need this shortly in your code.

### Screenshots

- **Selecting your project**\

- **Navigating to the Paymaster tool**\

- **Configuration screen**\

### Allowlist a Sponsorable Contract

1. From the Configuration page, ensure **Base Mainnet** (or **Base Goerli** if you’re testing) is selected.
2. Enable your paymaster by clicking the toggle button.
3. Click **Add** to add an allowlisted contract.
4. For this example, add [`0x83bd615eb93eE1336acA53e185b03B54fF4A17e8`][simple NFT contract], and add the function `mintTo(address)`.

> **Use your own contract**\
> We use a [simple NFT contract][simple NFT contract] on Base mainnet as an example. Feel free to substitute your own.

### Global & Per User Limits

Scroll down to the **Per User Limit** section. You can set:

- **Dollar amount limit** or **number of UserOperations** per user
- **Limit cycles** that reset daily, weekly, or monthly

For example, you might set:

- `max USD`to`$0.05`\*`max UserOperation`to`1`This means **each user** can only have \$0.05 in sponsored gas and **1** user operation before the cycle resets.

> **Limit Cycles**\
> These reset based on the selected cadence (daily, weekly, monthly).

Next, **Set the Global Limit**. For example, set this to`$0.07`so that once the entire paymaster has sponsored \$0.07 worth of gas (across all users), no more sponsorship occurs unless you raise the limit.

## Test Your Paymaster Policy

Now let’s verify that these policies work. We’ll:

1. Create two local key pairs (or use private keys you own).
2. Generate two Smart Accounts.
3. Attempt to sponsor multiple transactions to see your policy in action.

### Installing Foundry

1. Ensure you have **Rust** installed. If not:

#### Command```bash

curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

````2. Install Foundry:
#### Command```bash
 curl -L https://foundry.paradigm.xyz | bash
 foundryup
```3. Verify it works:
#### Command```bash
 cast --help
```If you see Foundry usage info, you’re good to go!

### Create Your Project & Generate Key Pairs

1. Make a new folder and install dependencies:
#### Command```bash
 mkdir sponsored_transactions
 cd sponsored_transactions
 npm init es6
 npm install permissionless
 npm install viem
 touch index.js
```2. Generate two key pairs with Foundry:
#### Command```bash
 cast wallet new
 cast wallet new
```You’ll see something like:
#### Command```bash
 Successfully created new keypair.
 Address: 0xD440D746...
 Private key: 0x01c9720c1dfa3c9...
```**Store these private keys somewhere safe** — ideally in a`.env`file.

### Project Structure With Environment Variables

Create a`.env`file in`sponsored_transactions`:
#### Command
```bash
PAYMASTER_RPC_URL=https://api.developer.coinbase.com/rpc/v1/base/<SPECIAL-KEY>
PRIVATE_KEY_1=0x01c9720c1dfa3c9...
PRIVATE_KEY_2=0xbcd6fbc1dfa3c9...
```> **Security**\
> **Never** commit`.env`files to a public repo!

## Example`index.js`(Using Twoslash)

Below is a full example of how you might structure`index.js`.\
We’ll use **twoslash** code blocks (\`\`\`\`js twoslash\`) to highlight key lines and explanations.
#### Code
```js
// --- index.js ---
// @noErrors

// 1. Import modules and environment variables
import 'dotenv/config';
import { http, createPublicClient, encodeFunctionData } from 'viem';
import { base } from 'viem/chains';
import { createSmartAccountClient } from 'permissionless';
import { privateKeyToSimpleSmartAccount } from 'permissionless/accounts';
import { createPimlicoPaymasterClient } from 'permissionless/clients/pimlico';

// 2. Retrieve secrets from .env
// Highlight: environment variables for paymaster, private keys
const rpcUrl = process.env.PAYMASTER_RPC_URL; // highlight
const firstPrivateKey = process.env.PRIVATE_KEY_1; // highlight
const secondPrivateKey = process.env.PRIVATE_KEY_2; // highlight

// 3. Declare Base addresses (entrypoint & factory)
const baseEntryPoint = '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789';
const baseFactoryAddress = '0x15Ba39375ee2Ab563E8873C8390be6f2E2F50232';

// 4. Create a public client for Base
const publicClient = createPublicClient({
 chain: base,
 transport: http(rpcUrl),
});

// 5. Setup Paymaster client
const cloudPaymaster = createPimlicoPaymasterClient({
 chain: base,
 transport: http(rpcUrl),
 entryPoint: baseEntryPoint,
});

// 6. Create Smart Accounts from the private keys
async function initSmartAccounts {
 const simpleAccount = await privateKeyToSimpleSmartAccount(publicClient, {
 privateKey: firstPrivateKey,
 factoryAddress: baseFactoryAddress,
 entryPoint: baseEntryPoint,
 });

 const simpleAccount2 = await privateKeyToSimpleSmartAccount(publicClient, {
 privateKey: secondPrivateKey,
 factoryAddress: baseFactoryAddress,
 entryPoint: baseEntryPoint,
 });

 // 7. Create SmartAccountClient for each
 const smartAccountClient = createSmartAccountClient({
 account: simpleAccount,
 chain: base,
 bundlerTransport: http(rpcUrl),
 middleware: {
 sponsorUserOperation: cloudPaymaster.sponsorUserOperation,
 },
 });

 const smartAccountClient2 = createSmartAccountClient({
 account: simpleAccount2,
 chain: base,
 bundlerTransport: http(rpcUrl),
 middleware: {
 sponsorUserOperation: cloudPaymaster.sponsorUserOperation,
 },
 });

 return { smartAccountClient, smartAccountClient2 };
}

// 8. ABI for the NFT contract
const nftAbi = [
 // ...
 // truncated for brevity
];

// 9. Example function to send a transaction from a given SmartAccountClient
async function sendTransaction(client, recipientAddress) {
 try {
 // encode the "mintTo" function call
 const callData = encodeFunctionData({
 abi: nftAbi,
 functionName: 'mintTo',
 args: [recipientAddress], // highlight: specify who gets the minted NFT
 });

 const txHash = await client.sendTransaction({
 account: client.account,
 to: '0x83bd615eb93eE1336acA53e185b03B54fF4A17e8', // address of the NFT contract
 data: callData,
 value: 0n,
 });

 console.log(`✅ Transaction successfully sponsored for ${client.account.address}`);
 console.log(`🔍 View on BaseScan: https://basescan.org/tx/${txHash}`;
 } catch (error) {
 console.error('Transaction failed:', error);
 }
}

// 10. Main flow: init accounts, send transactions
(async => {
 const { smartAccountClient, smartAccountClient2 } = await initSmartAccounts;

 // Send a transaction from the first account
 await sendTransaction(smartAccountClient, smartAccountClient.account.address);

 // Send a transaction from the second account
 // For variety, let’s also mint to the second account's own address
 await sendTransaction(smartAccountClient2, smartAccountClient2.account.address);
});
```> **Note**:
>
> * Run this via`node index.js`from your project root.
> * If your Paymaster settings are strict (e.g., limit 1 transaction per user), the second time you run the script, you may get a “request denied” error, indicating the policy is working.

## Hitting Policy Limits & Troubleshooting

1. **Per-User Limit**\
 If you see an error like:
#### JSON```json
 {
 "code": -32001,
 "message": "request denied - rejected due to maximum per address transaction count reached"
 }
```That means you’ve hit your **UserOperation** limit for a single account. Return to the [Coinbase Developer Platform] UI to adjust the policy.

2. **Global Limit**\
 If you repeatedly run transactions and eventually see:
#### JSON```json
 {
 "code": -32001,
 "message": "request denied - rejected due to max global usd Spend Permission reached"
 }
```You’ve hit the **global** limit of sponsored gas. Increase it in the CDP dashboard and wait a few minutes for changes to take effect.

## Verifying Token Ownership (Optional)

Want to confirm the token actually minted? You can read the NFT’s`balanceOf`function:
#### Code```js
import { readContract } from 'viem'; // highlight

// example function
async function checkNftBalance(publicClient, contractAddress, abi, ownerAddress) {
 const balance = await publicClient.readContract({
 address: contractAddress,
 abi,
 functionName: 'balanceOf',
 args: [ownerAddress],
 });
 console.log(`NFT balance of ${ownerAddress} is now: ${balance}`);
}
````

## Conclusion

In this tutorial, you:

- Set up and **configured** a Base Paymaster on the Coinbase Developer Platform.
- **Allowlisted** a contract and specific function (`mintTo`) for sponsorship.
- Established **per-user** and **global** sponsorship **limits** to control costs.
- Demonstrated the **sponsorship flow** with Smart Accounts using `permissionless`, `viem`, and Foundry-generated private keys.

This approach can greatly improve your dApp’s user experience by removing gas friction. For more complex sponsorship schemes (like daily or weekly cycles), simply tweak your per-user and global limit settings in the Coinbase Developer Platform.

> **Next Steps**
>
> - Use a [proxy service][proxy service] for better endpoint security.
> - Deploy your own contracts and allowlist them.
> - Experiment with bundling multiple calls into a single sponsored transaction.

## References

- [list of factory addresses]
- [CDP site]
- [Coinbase Developer Platform]
- [UI]
- [proxy service]
- [Paymaster Tool]
- [Foundry Book installation guide]
- [simple NFT contract]

[list of factory addresses]: https://www.alchemy.com/docs/wallets/smart-contracts/deployed-addresses
[CDP site]: https://portal.cdp.coinbase.com/
[Coinbase Developer Platform]: https://portal.cdp.coinbase.com/
[UI]: https://portal.cdp.coinbase.com/products/bundler-and-paymaster
[proxy service]: https://www.smartwallet.dev/guides/paymasters
[Paymaster Tool]: https://portal.cdp.coinbase.com/products/bundler-and-paymaster
[Foundry Book installation guide]: https://book.getfoundry.sh/getting-started/installation
[simple NFT contract]: https://basescan.org/token/0x83bd615eb93ee1336aca53e185b03b54ff4a17e8

**Happy Building on Base!**

# Base — Mini Apps ve OnchainKit — Hazır (BaseMan)

- Kaynak: https://docs.base.org/ (resmi doküman)
- Son hazırlayan: 2025-11-02

Amaç

- BaseMan’in Base Sepolia (84532) ve Base Mainnet (8453) üzerinde kararlı çalışması için mini app yayın akışını, OnchainKit yapılandırmasını ve RPC/bundler/paymaster ayarlarını standardize etmek.

Temel Kavramlar

- Zincir Kimlikleri: 8453 (Base Mainnet), 84532 (Base Sepolia).
- RPC Uçları: `https://mainnet.base.org` `https://sepolia.base.org`.
- OnchainKit Konfig: `rpcUrl`veya`apiKey`zorunlu; aksi halde onchain istekler başarısız olabilir.
- Mini App Yayınlama: Vercel dağıtımı, Base App üzerinden yayın (manifest/embed uyumu).

OnchainKit Entegrasyonu

- Sağlayıcı: OnchainKit Provider ile`chain`ve`projectId`/`rpcUrl`yapılandırması.
- Ağ Desteği: 8453/84532 desteklenir;`isBase({ chainId })`gibi yardımcılar mevcuttur.
- Telemetri/Analytics: (opsiyonel) komponent/komut olaylarını raporlama uçları.

Mini App Oluşturma/Yayınlama

- Şablon veya mevcut uygulamayı adaptasyon;`/.well-known/farcaster.json`manifestini ve`fc:miniapp`embed’ini servis etmek.
- Base App’te paylaşım/yayın akışı (dokümana göre): URL ile post oluşturma ve doğrulama.

Paymaster/Bundler (Özet — detay CDP dokümanında)

- CDP portalından Paymaster & Bundler endpoint’i alınır; allowlist/policy yapılandırılır.
- OnchainKit’te`config.paymaster`ile entegrasyon yapılabilir.

Uygulama Kontrol Listesi (Base)

- [ ] 8453/84532 chainId doğru seçiliyor
- [ ]`rpcUrl`veya`apiKey`sağlanmış
- [ ] RPC uçları erişilebilir (healthcheck)
- [ ] OnchainKit adası yalnızca web’de yükleniyor (miniapp içi hariç)
- [ ] Vercel dağıtımı sağlıklı; statik +`/api/*`uçları çalışıyor

BaseMan Eşleştirmesi

- RPC/env:`.env`içinde`BASE_RPC_URL`, `BASE_SEPOLIA_RPC_URL`(varsa), bundler/paymaster URL’leri
- OnchainKit ada:`src/ui/onchainkit-app.jsx`(bundle:`vendor/onchainkit/onchainkit.bundle.js`)
- Yükleme mantığı: `src/load-onchainkit.js`(miniapp tespiti ile web’de yükle)

Notlar

- Prod/staging için ayrı RPC/bundler/paymaster anahtarları önerilir. -`requiredChains` manifestte 8453/84532 olarak listelenmeli.

---- Hazır Özet Sonu — Aşağıda ham kaynak içerik bulunur ----

[Back to top](#table-of-contents)
