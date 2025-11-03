---
title: Coinbase Developer Platform Documentation
version: 0.1.0
updatedAt: 2025-11-02
owner: BaseMan
---

# Coinbase Developer Platform Documentation

## Quick Start / Checklist
- CDP projesi oluştur ve Paymaster/Bundler endpoint’lerini al
- Politika/allowlist yapılandır: sponsorluk verilecek sözleşme adreslerini ekle, limitleri belirle
- Bağımlılıklar: `npm install`- Wagmi/Viem entegrasyonu: Paymaster ile gasless için client’ı yapılandır (Paymaster & Bundler URL)
- Yerel geliştirme:`npm run dev`ve akıllı cüzdanla giriş yap, örnek işlemi tetikle
- Günlükleme/hata ayıklama: Paymaster/Bundler loglarını izle, limit aşımlarını doğrula
- TOC güncelle:`npm run docs:toc`### Related Docs
- Base: [Base_MiniApps_Docs.md](Base_MiniApps_Docs.md)
- Farcaster Mini Apps: [Farcaster_MiniApps_Docs.md](Farcaster_MiniApps_Docs.md)
 - Glossary: [glossary.md](glossary.md)

### Env Checklist
- CDP_API_KEY, CDP_PAYMASTER_URL, CDP_BUNDLER_URL
- RPC_URL_BASE_SEPOLIA ve/veya RPC_URL_BASE
- WALLETCONNECT_PROJECT_ID (Wagmi kullanımı için)
- Örnek dosya: [env.example](env.example)

### Diagrams```mermaid
flowchart LR
 U[User] --> W[Smart Wallet]
 W -->|userOperation| B[Bundler]
 B -->|sponsor request| P[Paymaster]
 P -->|policy check| P
 P -->|paymaster data| B
 B -->|submit to chain| C[Base]
 C --> R[Receipt]
 R --> U
```<!-- TOC -->
## Table of Contents
- [ONCHAIN TOOLS](#onchain-tools)
- [Paymaster](#paymaster)
- [Get Started](#get-started)
 - [Example Repository](#example-repository)
 - [Want More Guidance?](#want-more-guidance)
- [Getting an endpoint on Base Sepolia](#getting-an-endpoint-on-base-sepolia)
- [Setting up an app template](#setting-up-an-app-template)
 - [Add your paymaster to the transact button](#add-your-paymaster-to-the-transact-button)
 - [Start the app locally](#start-the-app-locally)
 - [Open the app in your browser and sign in with a smart wallet](#open-the-app-in-your-browser-and-sign-in-with-a-smart-wallet)
 - [Initiate the transaction](#initiate-the-transaction)
- [Other Examples](#other-examples)
 - [Can I use the Paymaster on a testnet?](#can-i-use-the-paymaster-on-a-testnet)
 - [Are there any contract sponsorships that come out of the box?](#are-there-any-contract-sponsorships-that-come-out-of-the-box)
 - [How is my billing calculated?](#how-is-my-billing-calculated)
 - [How do I download my userOp log?](#how-do-i-download-my-userop-log)
 - [What currency will I be charged in for the use of the Paymaster?](#what-currency-will-i-be-charged-in-for-the-use-of-the-paymaster)
 - [Where can I see my bill?](#where-can-i-see-my-bill)
 - [How can I get Paymaster credits?](#how-can-i-get-paymaster-credits)
 - [Can I apply for additional gas credits?](#can-i-apply-for-additional-gas-credits)
 - [What is Account Abstraction (ERC-4337)?](#what-is-account-abstraction-erc-4337)
 - [What are the key components of Account Abstraction?](#what-are-the-key-components-of-account-abstraction)
 - [Do I need the address of the Paymaster in order to sponsor transactions?](#do-i-need-the-address-of-the-paymaster-in-order-to-sponsor-transactions)
 - [What version is supported for the entrypoint?](#what-version-is-supported-for-the-entrypoint)
 - [How does a userOperation get onchain?](#how-does-a-useroperation-get-onchain)
 - [What happens if a userOperation specifies gas limits that are too low?](#what-happens-if-a-useroperation-specifies-gas-limits-that-are-too-low)
 - [What are the gas components of a userOperation?](#what-are-the-gas-components-of-a-useroperation)
 - [Which SDKs can I use to interact with my Paymaster and Bundler?](#which-sdks-can-i-use-to-interact-with-my-paymaster-and-bundler)
 - [Can I sponsor transactions for any wallet?](#can-i-sponsor-transactions-for-any-wallet)
 - [What's the difference between an EOA and a Smart Wallet?](#whats-the-difference-between-an-eoa-and-a-smart-wallet)
 - [How can I see the activity (userOperations, sponsored transactions, etc.) for my project?](#how-can-i-see-the-activity-useroperations-sponsored-transactions-etc-for-my-project)
 - [Can I use other third party bundlers with the Base Paymaster?](#can-i-use-other-third-party-bundlers-with-the-base-paymaster)
 - [Where can I reach out for additional help?](#where-can-i-reach-out-for-additional-help)
 - [Where can I demo how a Paymaster works?](#where-can-i-demo-how-a-paymaster-works)
- [What is the difference between 7702 and 4337?](#what-is-the-difference-between-7702-and-4337)
- [Key terms](#key-terms)
- [Will Base Appchains support 7702?](#will-base-appchains-support-7702)
- [What address should I use for my Smart Account (4337) Implementation?](#what-address-should-i-use-for-my-smart-account-4337-implementation)
- [Does the current version of Paymaster support EIP-7702 transactions?](#does-the-current-version-of-paymaster-support-eip-7702-transactions)
- [How do I upgrade my wallet to 7702?](#how-do-i-upgrade-my-wallet-to-7702)
- [How can I tell if a wallet is a smart account or EOA?](#how-can-i-tell-if-a-wallet-is-a-smart-account-or-eoa)
- [Who can be a relayer?](#who-can-be-a-relayer)
- [How can developers protect their users from 7702 attacks?](#how-can-developers-protect-their-users-from-7702-attacks)
- [Guides](#guides)
- [Prerequisites](#prerequisites)
- [Getting an endpoint on Base Sepolia](#getting-an-endpoint-on-base-sepolia)
- [Sending a transaction](#sending-a-transaction)
 - [1. Initialize your project](#1-initialize-your-project)
 - [2. Download dependencies](#2-download-dependencies)
 - [3. Create smart account using a private key](#3-create-smart-account-using-a-private-key)
 - [4. Add your smart contract's ABI](#4-add-your-smart-contracts-abi)
 - [5. Create the Bundler and Paymaster clients, submit transaction](#5-create-the-bundler-and-paymaster-clients-submit-transaction)
- [Next steps](#next-steps)
- [Other examples](#other-examples)
- [Troubleshooting](#troubleshooting)
- [Initial setup: Configure CDP Account](#initial-setup-configure-cdp-account)
 - [Obtain Paymaster & Bundler Endpoint](#obtain-paymaster-bundler-endpoint)
- [Security](#security)
 - [Whitelist Contracts](#whitelist-contracts)
- [WalletConnect Project ID](#walletconnect-project-id)
- [Add Base to Wagmi configuration](#add-base-to-wagmi-configuration)
- [Implement Wagmi Hooks](#implement-wagmi-hooks)
- [Troubleshooting](#troubleshooting)
- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Allowlist Your Contract](#allowlist-your-contract)
- [Set Up Your Constants File](#set-up-your-constants-file)
- [Add the Contract ABI](#add-the-contract-abi)
- [Build the Sponsored Transaction Component](#build-the-sponsored-transaction-component)
- [You're Ready!](#youre-ready)
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
- [Example`index.js`](#example-indexjs)
- [Hitting Policy Limits & Troubleshooting](#hitting-policy-limits-troubleshooting)
- [Verifying Token Ownership (Optional)](#verifying-token-ownership-optional)
- [Conclusion](#conclusion)
- [Using Wagmi/Viem in a Next.js app](#using-wagmiviem-in-a-nextjs-app)
 - [Choose a paymaster service provider](#choose-a-paymaster-service-provider)
 - [Validate UserOperation](#validate-useroperation)
 - [Send EIP-5792 requests with a paymaster service capability](#send-eip-5792-requests-with-a-paymaster-service-capability)
- [Using Your Proxy URL](#using-your-proxy-url)
- [Paymaster Error Codes](#paymaster-error-codes)
- [Paymaster Gas Policy Errors](#paymaster-gas-policy-errors)
- [Bundler Error Codes](#bundler-error-codes)
- [Entrypoint Error Codes](#entrypoint-error-codes)
- [Request Logs](#request-logs)
- [Execution reverted](#execution-reverted)
 - [Issue regarding gas estimation](#issue-regarding-gas-estimation)
 - [Execution reverted with data](#execution-reverted-with-data)
 - [Execution reverted for an unknown reason](#execution-reverted-for-an-unknown-reason)
- [Invalid chain id](#invalid-chain-id)
- [Invalid UserOperation signature or paymaster signature](#invalid-useroperation-signature-or-paymaster-signature)
- [Paymaster Proxy](#paymaster-proxy)
- [DATA](#data)
- [Getting Started](#getting-started)
- [Overview](#overview)
- [Key features](#key-features)
- [Use cases](#use-cases)
- [Demo applications](#demo-applications)
- [Available services](#available-services)
 - [Step: Open SQL Playground](#step-open-sql-playground)
 - [Step: Try a query](#step-try-a-query)
 - [Step: Open Node Playground](#step-open-node-playground)
 - [Step: Run the RPC call](#step-run-the-rpc-call)
- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [1. Run a SQL query](#1-run-a-sql-query)
- [2. Make your first RPC call](#2-make-your-first-rpc-call)
- [What to read next](#what-to-read-next)
 - [What networks are supported?](#what-networks-are-supported)
 - [What is the rate limit?](#what-is-the-rate-limit)
 - [Do I need API keys?](#do-i-need-api-keys)
 - [How fresh is the data?](#how-fresh-is-the-data)
 - [How much does it cost?](#how-much-does-it-cost)
 - [Where can I get help?](#where-can-i-get-help)
- [Node](#node)
- [Overview](#overview)
- [Key features](#key-features)
- [Use cases](#use-cases)
- [Supported networks](#supported-networks)
- [Getting started](#getting-started)
- [Rate limits](#rate-limits)
- [API Reference](#api-reference)
- [Support and feedback](#support-and-feedback)
 - [Step: Open Node Playground](#step-open-node-playground)
 - [Step: Run the RPC call](#step-run-the-rpc-call)
- [Prerequisites](#prerequisites)
- [1. Try it in the playground](#1-try-it-in-the-playground)
- [2. Get your RPC endpoint](#2-get-your-rpc-endpoint)
 - [Step: Navigate to Node](#step-navigate-to-node)
 - [Step: Select your network](#step-select-your-network)
- [3. Make your first request](#3-make-your-first-request)
- [What to read next](#what-to-read-next)
- [Webhooks](#webhooks)
- [Key features](#key-features)
- [Use cases](#use-cases)
- [Supported networks](#supported-networks)
- [What to read next](#what-to-read-next)
- [Overview](#overview)
- [Prerequisites](#prerequisites)
 - [Step: Create a Secret API Key](#step-create-a-secret-api-key)
 - [Step: Install cdpcurl](#step-install-cdpcurl)
 - [Step: Get a webhook URL](#step-get-a-webhook-url)
- [1. Construct subscription payload](#1-construct-subscription-payload)
 - [Configuration fields](#configuration-fields)
 - [Custom headers](#custom-headers)
- [2. Create subscription](#2-create-subscription)
- [Additional endpoints](#additional-endpoints)
 - [List all subscriptions](#list-all-subscriptions)
 - [View subscription details](#view-subscription-details)
 - [Update subscription](#update-subscription)
 - [Delete subscription](#delete-subscription)
- [What to read next](#what-to-read-next)
- [Overview](#overview)
- [Why verify signatures?](#why-verify-signatures)
- [How it works](#how-it-works)
 - [1. Create a verification function](#1-create-a-verification-function)
 - [2. Verify webhooks in your application](#2-verify-webhooks-in-your-application)
 - [Example webhook payload](#example-webhook-payload)
- [Security best practices](#security-best-practices)
- [Error handling](#error-handling)
- [What to read next](#what-to-read-next)
- [SQL API](#sql-api)
- [Key Features](#key-features)
- [Use Cases](#use-cases)
- [Schema](#schema)
- [Support and feedback](#support-and-feedback)
 - [Step: Open SQL Playground](#step-open-sql-playground)
 - [Step: Try a query](#step-try-a-query)
- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [1. Try it in the playground](#1-try-it-in-the-playground)
- [2. Run a query programmatically](#2-run-a-query-programmatically)
- [What to read next](#what-to-read-next)
- [Supported Tables](#supported-tables)
- [base.blocks](#baseblocks)
- [base.events](#baseevents)
- [base.transactions](#basetransactions)
- [base.encoded\_logs](#baseencodedlogs)
- [base.transfers](#basetransfers)
- [Overview](#overview)
- [For AI tools and query validators](#for-ai-tools-and-query-validators)
 - [Design Principles](#design-principles)
 - [Grammar Specification](#grammar-specification)
- [How to use this with AI tools](#how-to-use-this-with-ai-tools)
 - [What SQL features are supported?](#what-sql-features-are-supported)
 - [What's the difference between SQL API and Wallet History API?](#whats-the-difference-between-sql-api-and-wallet-history-api)
 - [Do I need API keys?](#do-i-need-api-keys)
 - [What are the query limits?](#what-are-the-query-limits)
 - [How do I optimize slow queries?](#how-do-i-optimize-slow-queries)
 - [What happens if my query times out?](#what-happens-if-my-query-times-out)
 - [What networks are supported?](#what-networks-are-supported)
 - [How fresh is the data?](#how-fresh-is-the-data)
 - [What data types does SQL API support?](#what-data-types-does-sql-api-support)
 - [How do I handle re-orgs?](#how-do-i-handle-re-orgs)
 - [Where can I get help?](#where-can-i-get-help)
- [Token Balances](#token-balances)
- [Overview](#overview)
- [Core capabilities](#core-capabilities)
- [Base support and performance](#base-support-and-performance)
- [Use cases](#use-cases)
- [What to read next](#what-to-read-next)
- [Overview](#overview)
- [Prerequisites](#prerequisites)
 - [Configure](#configure)
 - [Step: Install dependencies](#step-install-dependencies)
 - [Step: Create an .env file](#step-create-an-env-file)
 - [Step: Add API credentials](#step-add-api-credentials)
- [Example](#example)
- [Sample response](#sample-response)
 - [Response fields](#response-fields)
- [Pagination](#pagination)
- [What to read next](#what-to-read-next)
- [Address History](#address-history)
- [API REFERANCE](#api-referance)
- [CDP API V1](#cdp-api-v1)
- [Introduction](#introduction)
- [Getting Started](#getting-started)
- [Docs](#docs)
- [Prerequisites](#prerequisites)
- [1. Create an API key](#1-create-an-api-key)
 - [Server](#server)
 - [Client](#client)
- [2. Generate JWT (Server only)](#2-generate-jwt-server-only)
 - [Setup](#setup)
 - [Export](#export)
- [3. Authenticate](#3-authenticate)
 - [Server](#server)
 - [Client](#client)
- [What to read next](#what-to-read-next)
- [REST API](#rest-api)
 - [Base](#base)
 - [Ethereum](#ethereum)
 - [Solana](#solana)
 - [Others](#others)
- [JSON-RPC API](#json-rpc-api)
 - [Base](#base)
- [Network identifiers](#network-identifiers)
- [What to read next](#what-to-read-next)
- [JSON-RPC API](#json-rpc-api)
- [Constructing Requests](#constructing-requests)
- [Batch Requests](#batch-requests)
- [Ethereum Namespace](#ethereum-namespace)
 - [`eth_blockNumber`](#ethblocknumber)
 - [`eth_getBlockByNumber`](#ethgetblockbynumber)
 - [`eth_getBlockByHash`](#ethgetblockbyhash)
 - [`eth_getBlockTransactionCountByHash`](#ethgetblocktransactioncountbyhash)
 - [`eth_getBlockTransactionCountByNumber`](#ethgetblocktransactioncountbynumber)
 - [`eth_getTransactionByHash`](#ethgettransactionbyhash)
 - [`eth_getTransactionReceipt`](#ethgettransactionreceipt)
 - [`eth_getTransactionByBlockHashAndIndex`](#ethgettransactionbyblockhashandindex)
 - [`eth_getTransactionByBlockNumberAndIndex`](#ethgettransactionbyblocknumberandindex)
 - [`eth_getLogs`](#ethgetlogs)
 - [`eth_call`](#ethcall)
 - [`eth_getBalance`](#ethgetbalance)
 - [`eth_getCode`](#ethgetcode)
 - [`eth_getTransactionCount`](#ethgettransactioncount)
 - [`eth_chainId`](#ethchainid)
 - [`eth_sendRawTransaction`](#ethsendrawtransaction)
 - [`eth_gasPrice`](#ethgasprice)
 - [`eth_getStorageAt`](#ethgetstorageat)
 - [`eth_estimateGas`](#ethestimategas)
 - [`eth_protocolVersion`](#ethprotocolversion)
 - [`eth_syncing`](#ethsyncing)
 - [`eth_feeHistory`](#ethfeehistory)
 - [`eth_mining`](#ethmining)
 - [`eth_hashrate`](#ethhashrate)
 - [`eth_accounts`](#ethaccounts)
 - [`eth_newFilter`](#ethnewfilter)
 - [`eth_newBlockFilter`](#ethnewblockfilter)
 - [`eth_uninstallFilter`](#ethuninstallfilter)
 - [`eth_getFilterChanges`](#ethgetfilterchanges)
 - [`eth_getFilterLogs`](#ethgetfilterlogs)
 - [`eth_getFilteth_getWorkerLogs`](#ethgetfiltethgetworkerlogs)
 - [`eth_submitWork`](#ethsubmitwork)
 - [`eth_submitHashrate`](#ethsubmithashrate)
- [Debug Namespace](#debug-namespace)
 - [`debug_traceBlockByHash`](#debugtraceblockbyhash)
 - [`debug_traceBlockByNumber`](#debugtraceblockbynumber)
 - [`debug_traceCall`](#debugtracecall)
- [Net Namespace](#net-namespace)
 - [`net_version`](#netversion)
 - [`net_listening`](#netlistening)
 - [`net_peercount`](#netpeercount)
- [Web3 Namespace](#web3-namespace)
 - [`web3_clientVersion`](#web3clientversion)
- [Constructing Requests](#constructing-requests)
- [Bundler Namespace](#bundler-namespace)
 - [`eth_supportedEntryPoints`](#ethsupportedentrypoints)
 - [`eth_getUserOperationByHash`](#ethgetuseroperationbyhash)
 - [`eth_getUserOperationReceipt`](#ethgetuseroperationreceipt)
 - [`eth_sendUserOperation`](#ethsenduseroperation)
 - [`eth_estimateUserOperationGas`](#ethestimateuseroperationgas)
- [Paymaster Namespace](#paymaster-namespace)
 - [`pm_getPaymasterStubData`](#pmgetpaymasterstubdata)
 - [`pm_getPaymasterData`](#pmgetpaymasterdata)
 - [`pm_sponsorUserOperation`](#pmsponsoruseroperation)
 - [`pm_getAcceptedPaymentTokens`](#pmgetacceptedpaymenttokens)
 - [`pm_getAddressSponsorshipInfo`](#pmgetaddresssponsorshipinfo)
- [Constructing Requests](#constructing-requests)
- [JSON-RPC Methods for Address History Data](#json-rpc-methods-for-address-history-data)
 - [`cdp_listBalances`](#cdplistbalances)
 - [`cdp_listBalanceDetails`](#cdplistbalancedetails)
 - [`cdp_listBalanceHistories`](#cdplistbalancehistories)
 - [`cdp_listAddressTransactions`](#cdplistaddresstransactions)
- [SDKs](#sdks)
- [<Section>Build onchain</Section>](#sectionbuild-onchainsection)
- [<Section>Consumer APIs</Section>](#sectionconsumer-apissection)
- [<Section>Institutional APIs</Section>](#sectioninstitutional-apissection)
- [BUILD ONCHAIN](#build-onchain)
- [CDP SDKs V2](#cdp-sdks-v2)
- [Backend](#backend)
- [Installation](#installation)
- [API Keys](#api-keys)
- [Usage](#usage)
 - [Initialization](#initialization)
 - [Creating EVM or Solana accounts](#creating-evm-or-solana-accounts)
 - [Exporting EVM or Solana accounts](#exporting-evm-or-solana-accounts)
 - [Creating EVM or Solana accounts with policies](#creating-evm-or-solana-accounts-with-policies)
 - [Updating EVM or Solana accounts](#updating-evm-or-solana-accounts)
 - [Testnet faucet](#testnet-faucet)
 - [Sending transactions](#sending-transactions)
 - [EVM Smart Accounts](#evm-smart-accounts)
 - [EVM Swaps](#evm-swaps)
 - [Transferring tokens](#transferring-tokens)
- [Account Actions](#account-actions)
 - [EVM account actions](#evm-account-actions)
 - [Solana account actions](#solana-account-actions)
- [Policy Management](#policy-management)
 - [Create a Project-level policy that applies to all accounts](#create-a-project-level-policy-that-applies-to-all-accounts)
 - [Create an Account-level policy](#create-an-account-level-policy)
 - [Create a Solana Allowlist Policy](#create-a-solana-allowlist-policy)
 - [List Policies](#list-policies)
 - [Retrieve a Policy](#retrieve-a-policy)
 - [Update a Policy](#update-a-policy)
 - [Delete a Policy](#delete-a-policy)
 - [Validate a Policy](#validate-a-policy)
 - [End-user Management](#end-user-management)
- [Authentication tools](#authentication-tools)
- [Error Reporting](#error-reporting)
- [Usage Tracking](#usage-tracking)
- [License](#license)
- [Support](#support)
- [Security](#security)
- [FAQ](#faq)
 - [AggregateError \[ETIMEDOUT]](#aggregateerror-etimedout)
 - [Error \[ERR\_REQUIRE\_ESM]: require of ES modules is not supported.](#error-errrequireesm-require-of-es-modules-is-not-supported)
 - [Jest encountered an unexpected token](#jest-encountered-an-unexpected-token)
- [Classes](#classes)
 - [CdpClient](#cdpclient)
- [Interfaces](#interfaces)
 - [CdpClientOptions](#cdpclientoptions)
 - [Overview](#overview)
 - [Generate a JWT](#generate-a-jwt)
 - [Generate your authorization headers](#generate-your-authorization-headers)
 - [Use an Axios request interceptor](#use-an-axios-request-interceptor)
 - [Authentication parameters](#authentication-parameters)
- [Modules](#modules)
- [Frontend](#frontend)
- [Quickstart](#quickstart)
- [CDP SDKs V1](#cdp-sdks-v1)
- [Documentation](#documentation)
- [CDP API Documentation](#cdp-api-documentation)
- [Requirements](#requirements)
- [Copy](#copy)
- [Copy](#copy)
- [Installation](#installation)
- [Copy](#copy)
- [Copy](#copy)
- [Copy](#copy)
- [Usage](#usage)
- [Initialization](#initialization)
- [Copy](#copy)
- [Copy](#copy)
- [Copy](#copy)
- [Copy](#copy)
- [Copy](#copy)
- [Copy](#copy)
- [Copy](#copy)
- [Copy](#copy)
- [Copy](#copy)
- [Copy](#copy)
- [Copy](#copy)
- [Gasless USDC Transfers](#gasless-usdc-transfers)
- [Copy](#copy)
- [Copy](#copy)
- [Trading Funds](#trading-funds)
- [Copy](#copy)
- [Re-Instantiating Wallets](#re-instantiating-wallets)
- [Copy](#copy)
- [Copy](#copy)
- [Copy](#copy)
- [Copy](#copy)
- [Copy](#copy)
- [Copy](#copy)
- [Acknowledgments](#acknowledgments)
- [Temel Kavramlar](#temel-kavramlar)
- [Notlar](#notlar)
<!-- /TOC -->


https://docs.cdp.coinbase.com/

## ONCHAIN TOOLS

## Paymaster

# Welcome to Paymaster

The Coinbase Paymaster API provides [ERC-4337](https://www.erc4337.io/) Account Abstraction endpoints to send transactions from smart wallets and sponsor gas for users.

Paymaster is [ERC-7677](https://www.erc7677.xyz/introduction) compliant and supports both [pm\_getPaymasterStubData](https://www.erc7677.xyz/reference/paymasters/getPaymasterStubData) and [pm\_getPaymasterData](https://www.erc7677.xyz/reference/paymasters/getPaymasterData)

The endpoint also provides access to our Bundler.

## Get Started

1. [Create](https://coinbase.com/developer-platform) a new CDP account or [sign in](https://portal.cdp.coinbase.com) to your existing account.
2. Create a new project.
3. Use the Playground to make a request and see the response.
4. Set your gas policy configurations. Allowlist at least one contract to protect against unintended sponsorship (disregard if allowlisting through a paymaster proxy).
5. Start sending UserOperations and creating gasless experiences for your users.
6. [Apply for additional gas credits](https://docs.google.com/forms/d/1yPnBFW0bVUNLUN_w3ctCqYM9sjdIQO3Typ53KXlsS5g/viewform?edit_requested=true\&pli=1) as you scale.


 ![](https://mintcdn.com/coinbase-prod/s_QeFV8SFwGVfV_u/paymaster/images/pb-sponsorship-scw.png?fit=max&auto=format&n=s_QeFV8SFwGVfV_u&q=85&s=a6e63e0bc522da8a903df03727f52638)


### Example Repository

See [our examples on GitHub](https://github.com/coinbase/paymaster-bundler-examples) for details on integrating our Paymaster with popular SDKs.

### Want More Guidance?

If you'd like more specific guidance, reach out to us in the `#paymaster`channel in the CDP Discord.


# Quickstart- Set up your Paymaster on your application

This Paymaster quickstart tutorial explains how to set up a basic app and sponsor transactions using [OnchainKit](https://onchainkit.xyz/) and Coinbase Smart Wallet.

## Getting an endpoint on Base Sepolia

> **How to Get a Paymaster & Bundler endpoint on Base testnet (Sepolia) from CDP**

1. [Create](https://coinbase.com/developer-platform) a new CDP account or [sign in](https://portal.cdp.coinbase.com) to your existing account.
2. Navigate to [Paymaster](https://portal.cdp.coinbase.com/products/bundler-and-paymaster)
3. Add the following address to the allowlist under **Configuration**—this is the address of the contract we are calling:```0x67c97D1FB8184F038592b2109F854dfb09C77C75```4. Switch to Base testnet (Sepolia) in the top right of the configuration.
5. Copy your endpoint to use later.


 ![](https://mintcdn.com/coinbase-prod/s_QeFV8SFwGVfV_u/paymaster/images/pb-paymaster-config.png?fit=max&auto=format&n=s_QeFV8SFwGVfV_u&q=85&s=a834cc544f4f4358fbe129d5c766c8c0)


## Setting up an app template

Clone the repo
#### Code```js
git clone https://github.com/coinbase/onchain-app-template.git
cd onchain-app-template
```You can find the API key on the Coinbase Developer Portal's [OnchainKit page](https://portal.cdp.coinbase.com/products/onchainkit If you don't have an account, you will need to create one.
You can find your Wallet Connector project ID at Wallet Connect.
Add the following to your`.env`file
#### Code```js
NEXT_PUBLIC_PAYMASTER_AND_BUNDLER_ENDPOINT=ADD_YOUR_PAYMASTER_URL_HERE
NEXT_PUBLIC_CDP_API_KEY=ADD_YOUR_ONCHAINKIT_KEY_HERE
NEXT_PUBLIC_WC_PROJECT_ID=ADD_YOUR_PROJECT_ID_HERE
```Install dependencies - run these in your terminal in the root of the project
#### Code```js
# Install bun in case you don't have it
bun curl -fsSL <https://bun.sh/install> | bash

# Install packages
bun i
```### Add your paymaster to the transact button

Navigate to`/src/components/OnchainProviders.tsx`and modify the OnchainKitProvider's`config`object to include the paymaster URL.
#### Code```js

 <OnchainKitProvider 
apiKey={NEXT_PUBLIC_CDP_API_KEY} 
chain={baseSepolia} 
config={{ paymaster: process.env.NEXT_PUBLIC_PAYMASTER_AND_BUNDLER_ENDPOINT }}
>
 {children}
 </OnchainKitProvider>
```Navigate to`/src/components/TransactionWrapper.tsx`and modify the Transaction component to use the`isSponsored`prop.
#### Code```js
 <Transaction
isSponsored
address={address}
contracts={contracts}
className="w-[450px]"
chainId={BASE_SEPOLIA_CHAIN_ID}
onError={handleError}
onSuccess={handleSuccess}
 >
<TransactionButton
 className="mt-0 mr-auto ml-auto w-[450px] max-w-full text-[white]"
 text="Collect"
/>
<TransactionStatus>
 <TransactionStatusLabel />
 <TransactionStatusAction />
</TransactionStatus>
 </Transaction>
```### Start the app locally
#### Code```js
bun run dev
```### Open the app in your browser and sign in with a smart wallet

Navigate to [http://localhost:3000

Click connect and sign in with your smart wallet or create a new one.

### Initiate the transaction

Click the "Collect" button and your paymaster will sponsor. Note only Smart Wallets can have sponsored transactions so EOA accounts will not get sponsorship.

That's it! You've successfully set up your paymaster on your application.

## Other Examples

Additional documentation and information on Coinbase Smart Wallet is at [smartwallet.dev](https://smartwallet.dev/)

Check out how to build onchain applications with ease using [OnchainKit](https://onchainkit.xyz/)


# Paymaster Features

### Can I use the Paymaster on a testnet?

Yes, the Paymaster API works for both Base and Base testnet (Base Sepolia). To get started, enable your paymaster and select the Base Sepolia network from the network selection dropdown.

![](https://mintcdn.com/coinbase-prod/s_QeFV8SFwGVfV_u/paymaster/images/paymaster-network-dropdown.png?fit=max&auto=format&n=s_QeFV8SFwGVfV_u&q=85&s=48b6e056837286caed41a449841dcdcd)
<Info>
 All transactions are sponsored on Base Sepolia when using Coinbase Smart Wallet.
</Info>

### Are there any contract sponsorships that come out of the box?

You'll notice some tokens labeled "Free to send"—that means Coinbase Wallet is covering their gas fees. Transactions for USDC, CBBTC, and EURC smart contracts are automatically sponsored when you use [Coinbase Smart Wallet](/server-wallets/v1/concepts/smart-wallets).

| Sponsored Contract | Address | Explorer Link |
| ------------------ | ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| CBBTC | 0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf | [https://basescan.org/token/0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf |
| USDC | 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913 | [https://basescan.org/token/0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913 |
| EURC | 0x60a3E35Cc302bFA44Cb288Bc5a4F316Fdb1adb42 | [https://basescan.org/token/0x60a3E35Cc302bFA44Cb288Bc5a4F316Fdb1adb42 |


# Billing & Credits

### How is my billing calculated?

Your bill is calculated using the formula:```actualGasUsed * ethPriceUsd * 1.07.```> Note:
Each operation is charged based on the actual gas used (as recorded in the`UserOperationEvent`— not the transaction receipt) multiplied by the current ETH price in USD, plus a 7% markup. For detailed billing information, download your userOp log from the paymaster tool.

### How do I download my userOp log?

Navigate to the`Logs`tab in the paymaster tool and click the`Export User Op logs`button.

![](https://mintcdn.com/coinbase-prod/s_QeFV8SFwGVfV_u/paymaster/images/export-userop-logs.png?fit=max&auto=format&n=s_QeFV8SFwGVfV_u&q=85&s=a0986d97ee0dd22df71e8f92d8930252)
### What currency will I be charged in for the use of the Paymaster?

You will be billed in USD.

### Where can I see my bill?

Your paymaster bill is available for download from the Billing tab on the CDP home page. Navigate to the [Portal](https://portal.cdp.coinbase.com/) then select the`Billing`tab.

### How can I get Paymaster credits?

Developers can apply for a discretionary top-up of gas credits of up to \$15,000, with further bonuses available for supporting Coinbase Smart Wallet and engaging with the Base Gasless Campaign.

### Can I apply for additional gas credits?

Yes, you can apply for additional gas credits as you scale by using [this form](https://docs.google.com/forms/d/1yPnBFW0bVUNLUN_w3ctCqYM9sjdIQO3Typ53KXlsS5g/viewform?edit_requested=true\&pli=1).



# Account Abstraction Basics

### What is Account Abstraction (ERC-4337)?

Account Abstraction gives onchain accounts logic, meaning expanded feature sets (such as batched transactions) and improved security with Passkeys. In this model, operations are packaged as "userOperations" and processed through several specialized roles:

### What are the key components of Account Abstraction?

* **User:** Initiates an operation by signing a userOperation, similar to signing a transaction with a private key.
* **Bundler:** Collects userOperations, bundles them together, and submits them to the network through a central contract, acting like a traditional externally owned account (EOA).
* **Entrypoint (Contract):** Receives bundled operations, calculates the gas required, and manages interactions between the Smart Account and the Paymaster. It orchestrates the transaction flow.
* **Paymaster:** A smart contract that covers the gas fees on behalf of the Smart Account, allowing users to interact with the blockchain without holding ETH.
* **Smart Account:** A smart account wallet that validates signatures and executes transactions once all the necessary checks (such as gas fee payments) are complete.

### Do I need the address of the Paymaster in order to sponsor transactions?

No, you don't need the Paymaster contract address in order to sponsor transactions using the Paymaster tool from Coinbase Developer Platform. CDP Paymaster streamlines integration by merging Paymaster and Bundler into a single, unified endpoint—much like an API endpoint—so you simply use your Paymaster endpoint to send transaction requests.

* Example:```javascript
 const hash = await bundlerClient.sendUserOperation({
calls: [{
 abi: WagmiAbi,
 functionName: 'mint',
 to: '0xfBA3912Ca0d4d858C843e2EE08967fC04f3B79c2',
}],
 });
```### What version is supported for the entrypoint?

v0.6

### How does a userOperation get onchain?

1. **User Operation:** A user signs a userOperation, which includes all necessary details to perform an action including the sender, nonce, initCode and callData.
2. **Gas estimation:** Gas is estimated based on the userOperation by calling the bundler RPC method`eth_estimateUserOperationGas`.
3. **Bundler Submission:** The bundler collects and submits these operations to the Entrypoint. RPC method: `eth_sendUserOperation`4. **Entrypoint Processing:** The Entrypoint calculates the required gas by simulating the execution of the userOperation and examining the gas consumption during the simulation. This is done via the`simulateHandleOp`function. After simulation, the Entrypoint coordinates with the Paymaster (if applicable) to cover fees, and forwards the operation to the Smart Account.
5. **Smart Account Execution:** The Smart Account validates the operation and executes the intended action on the blockchain.

### What happens if a userOperation specifies gas limits that are too low?

UserOperations require gas limits to pay for the computational resources needed to execute it onchain. When the gas limit set for the operation is too low, meaning the transaction ran out of computational resources before completing, it will run out of gas and revert onchain during execution.

* See Alchemy's breakdown for [more details](https://www.alchemy.com/blog/erc-4337-gas-estimation)

### What are the gas components of a userOperation?

* **preVerificationGas:** The amount of gas to pay the bundler for pre-verification execution and calldata. This covers intrinsic bundle gas, calldata costs, and any entry-point overhead not metered onchain—it can spike during L1 fee surges and will cause the bundler to reject the op if set too low.


> Note:
Add a multiplier to avoid exclusions

 Consider applying a multiplier (e.g., 1.5×) to your estimated value during periods of high congestion to avoid exclusions.

* **verificationGasLimit:** The amount of gas allocated for the verification step, including smart wallet authentication checks and paymaster authorization logic. This value is generally static once you've determined the worst-case auth cost.

* **callGasLimit:** The gas allocated for the main execution phase of the userOp (e.g., Morpho contract call). Like the`verificationGasLimit`, this is typically a fixed limit based on your expected execution workload.

* **maxFeePerGas**
 The maximum fee (base fee + priority fee) per gas unit that you're willing to pay, equivalent to EIP-1559's `max_fee_per_gas`. Setting this too low may exclude your ops from being included in blocks.

* **maxPriorityFeePerGas**
 The maximum priority (tip) fee per gas unit, equivalent to EIP-1559's `max_priority_fee_per_gas`. Adjust this to help your ops compete for inclusion without overpaying.

### Which SDKs can I use to interact with my Paymaster and Bundler?

The best way to interact with the Paymaster is via frontend React libraries like [OnchainKit](https://docs.base.org/onchainkit/getting-started) that provide easy to use Components and work seamlessly with our Paymaster.

* Additional SDKs like [Viem](https://viem.sh/) and [Permissionless](https://docs.pimlico.io/permissionless) simplify the process of creating a smart wallet, constructing a userOperation, and sending it onchain using a bundler client and Paymaster.
* For additional help, check out our [Paymaster Examples](https://github.com/coinbase/paymaster-bundler-examples) repository, which includes Implementations across a wide range of clients and SDKs.

### Can I sponsor transactions for any wallet?

Today, gas sponsorship only works with contract-based accounts (e.g., the [Coinbase Smart Wallet](https://www.coinbase.com/wallet/smart-wallet not with traditional Externally Owned Accounts (EOAs). With [Ethereum's Pectra upgrade, EIP-7702](https://www.coinbase.com/learn/crypto-basics/ethereum-pectra-upgrade) will allow EOAs to function as smart contract accounts – enabling gas sponsorship for their transactions as well.

### What's the difference between an EOA and a Smart Wallet?

| Feature | Externally Owned Account (EOA) | Smart Wallets (contract accounts) |
| :---------------- | :--------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------- |
| **Control** | Governed solely by a private key (seed phrase or hardware wallet) | Governed by onchain contract code |
| **Creation** | Instantly "exists" when a private key is generated (no onchain deploy) | Created by deploying a smart contract (requires gas/ETH) |
| **Functionality** | Basic ETH transfers & interactions with onchain applications | Programmable: transaction batching, pay fees in tokens, custom auth logic, etc. |
| **Gas & Fees** | Must hold ETH to pay gas | Can implement gas abstractions: fee sponsorship, stable-coin payments, batching transactions, and many more! |
| **Security** | Relies on single-key management | Supports multi-sig, 2FA, social or account-recovery schemes |
| **Recovery** | No built-in recovery if key is lost | Can include social recovery or guardian-based recovery |



# Getting Help

### How can I see the activity (userOperations, sponsored transactions, etc.) for my project?

The Paymaster tool offers two main views for tracking your project:

* **Analytics:** Provides an overview of your sponsorships with graphs showing user operations, unique wallets, and total gas sponsored—a great way to gauge your application's performance.
* **Logs:** Displays requests sent to your Paymaster and Bundler Endpoint (see our [API documentation](/api-reference/json-rpc-api/core). This view is also useful for troubleshooting unexpected behavior. You can export userOperations from either tab.

### Can I use other third party bundlers with the Base Paymaster?

Currently, our paymaster is designed to function exclusively with our Bundler. This approach ensures the safest and most reliable developer experience, along with consistent uptime and service quality.

Developers using our Paymaster + Bundler can take advantage of our Paymaster Credits program enabling you to [sponsor up to \$15K](https://docs.google.com/forms/d/1yPnBFW0bVUNLUN_w3ctCqYM9sjdIQO3Typ53KXlsS5g/viewform?edit_requested=true\&pli=1) in gas across Base.

### Where can I reach out for additional help?

If you are experiencing issues with the Paymaster, please reach out to us on Discord.


> Note:
When contacting the Paymaster team on Discord, please include as much detail as possible about your issue and project.
 Providing error logs, screenshots, and a link to your repository will help us assist you more efficiently.

### Where can I demo how a Paymaster works?

* Demo application: [https://onchain-app-template.vercel.app/
* Repository: [Examples Repo](https://github.com/coinbase/paymaster-bundler-examples/tree/master/examples)


# EIP-7702 FAQs

## What is the difference between 7702 and 4337?

* [7702](https://eips.ethereum.org/EIPS/eip-7702) lets you upgrade an EOA into a smart account at the same address, supporting code delegation.
* [4337](https://eips.ethereum.org/EIPS/eip-4337) defines the account abstraction infrastructure (userops, paymasters, bundlers) for smart account logic.
* They work best **together**—7702 lets you add 4337 support to any EOA.

## Key terms

* **Authorization:** Signed message specifying chain, address, and signature to allow code delegation; can be single- or multi-chain. Only the most recent authorization is active.
* **Delegate:** The contract code that your EOA points to and executes.
* **Relayer:** Entity that submits the transaction and pays gas; can be any account with a private key including a bundler.

## Will Base Appchains support 7702?

* Yes, after 7702 is live on Base mainnet, Appchains will follow.

## What address should I use for my Smart Account (4337) Implementation?

* The Coinbase Smart Wallet (CBSW) implementation address for both [Base](https://basescan.org/address/0x000100abaad02f1cfC8Bbe32bD5a564817339E72#code) and [Base Sepolia](https://sepolia.basescan.org/address/0x000100abaad02f1cfC8Bbe32bD5a564817339E72#code) is `0x000100abaad02f1cfC8Bbe32bD5a564817339E72`## Does the current version of Paymaster support EIP-7702 transactions?

* Yes, as long as the EOA is upgraded to support ERC-4337 validation logic (i.e., after the 7702 upgrade) by sending an [authorization transaction](https://viem.sh/docs/eip7702/contract-writes) that designates a valid smart contract implementation for the account.

## How do I upgrade my wallet to 7702?

* Send a special EIP-7702 transaction that includes a signed authorization and the new contract code to delegate to your EOA.```javascript

// Step 1: Setup signer and smart account
const eoa7702 = privateKeyToAccount("0xPRIVATEKEY"); //Also acts as Relayer
const smartAccountImplementation = "0x000100abaad02f1cfC8Bbe32bD5a564817339E72"; // CBSW account implementation

//Step 2: Create a wallet client
export const walletClient = createWalletClient({
 account: eoa7702,
 chain: baseSepolia,
 transport: http(CDP_RPC_URL),
})

// Step 3: Sign EIP-7702 authorization
const authorizationHash = await sepoliaWalletClient.signAuthorization({
 account: eoa7702,
 contractAddress: smartAccountImplementation,
});

// Step 4: Send authorization onchain
const hash = await walletClient.sendTransaction({ 
 authorizationList: [authorization], 
 to: eoa.address, 
})
```## How can I tell if a wallet is a smart account or EOA?

* Check the deployed code at the address by making an RPC call to`eth_getCode(address)`. If not `0x`, the account is upgraded.
* [https://www.alchemy.com/docs/node/ethereum/ethereum-api-endpoints/eth-get-code

## Who can be a relayer?

* Any account with a private key can relay the upgrade transaction.
* For sponsored (gasless) transactions **after** upgrade, a relayer may interact with a bundler or paymaster for reimbursement.
* Bundlers are not required for the initial 7702 tx, but are needed for subsequent ERC-4337 (userop) flows.

## How can developers protect their users from 7702 attacks?

* **Use only trusted delegate contracts**: Verify that the smart contract implementation you're asking users to delegate to is legitimate and audited
* **Verify contract addresses on block explorers**: Double-check contract addresses on a block explorer (Etherscan/Basescan) before implementing them in your application to ensure they match expected implementations
* **Implement proper validation**: Add checks in your application to verify that the delegate contract address matches known safe implementations (e.g., Coinbase Smart Wallet implementation)
* **Educate users**: Provide clear information about what the authorization does and which contract they're delegating to
* **Use established implementations**: Prefer well-known, audited smart account implementations rather than custom or unverified contracts



## Guides

# Submit your first sponsored smart account transaction

This Paymaster quickstart tutorial explains how to submit your first smart account transaction on Base Sepolia using [Viem](https://viem.sh/ with gas sponsorship from [Coinbase Developer Platform](https://portal.cdp.coinbase.com/products/bundler-and-paymaster The example below sponsors an NFT mint, but can be updated to call your smart contract instead.

## Prerequisites
```node >= 14.0.0
npm >= 6.0.0```## Getting an endpoint on Base Sepolia

> **How to Get a Paymaster & Bundler endpoint on Base testnet (Sepolia) from CDP**

1. [Create](https://coinbase.com/developer-platform) a new CDP account or [sign in](https://portal.cdp.coinbase.com) to your existing account.
2. Navigate to [Paymaster](https://portal.cdp.coinbase.com/products/bundler-and-paymaster)
3. The address of the NFT contract we are calling is`0x66519FCAee1Ed65bc9e0aCc25cCD900668D3eD49`, add that to the contract allowlist and save the policy.
4. Switch to Base testnet (Sepolia) in the top right of the configuration.
5. Copy your endpoint to use later.


 ![](https://mintcdn.com/coinbase-prod/s_QeFV8SFwGVfV_u/paymaster/images/pb-paymaster-config-highlight.png?fit=max&auto=format&n=s_QeFV8SFwGVfV_u&q=85&s=cb6cba3f85becc7b7f0d25cc9e98646e)


## Sending a transaction

**How to call the mint function of a Base Sepolia NFT contract (or contract of choice)**

### 1. Initialize your project

In your terminal, create a directory called `paymaster-tutorial`and initialize a project using [npm](https://www.npmjs.com/)
#### Code```js
mkdir paymaster-tutorial
cd paymaster-tutorial
npm init es6
```### 2. Download dependencies

2. Install`viem`.
#### Code
```js
npm install viem
```### 3. Create smart account using a private key

The example below uses Coinbase smart wallet, but any smart account will work.
a. Create a new private key with [Foundry](https://book.getfoundry.sh/reference/cast/cast-wallet-new)
b. Install Foundry:`curl -L https://foundry.paradigm.xyz | bash`c. Generate a new key pair:`cast wallet new`.
d. Update your `config.js`file with the private key and create the account.
#### Code```js
//config.js
import { createPublicClient, http } from 'viem'
import { toCoinbaseSmartAccount } from 'viem/account-abstraction'
import { baseSepolia } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'

// Your RPC url. Make sure you're using the right network (base vs base-sepolia)
export const RPC_URL = "https://api.developer.coinbase.com/rpc/v1/base-sepolia/<your-rpc-token>"

export const client = createPublicClient({
 chain: baseSepolia,
 transport: http(RPC_URL),
})

// Creates a Coinbase smart wallet using an EOA signer
const owner = privateKeyToAccount('<your-private-key>')
export const account = await toCoinbaseSmartAccount({
 client,
 owners: [owner]
}) 
```### 4. Add your smart contract's ABI

Create a file called`example-app-abi.js`to store our NFT contract's abi and address. You will have to update this to your smart contract's ABI.
#### Code```js
//example-app-abi.js
export const abi = [
 {
inputs: [
 { internalType: "address", name: "recipient", type: "address" },
 { internalType: "uint16", name: "item", type: "uint16" },
],
name: "mintTo",
outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
stateMutability: "payable",
type: "function",
 },
];
```### 5. Create the Bundler and Paymaster clients, submit transaction

Create a new file called`index.js`#### Code```ts
//index.js
import { http } from "viem";
import { baseSepolia } from "viem/chains";
import { createBundlerClient } from "viem/account-abstraction";
import { account, client, RPC_URL } from "./config.js";
import { abi } from "./example-app-abi.js";

// Logs your deterministic public address generated by your private key
console.log(`Minting nft to ${account.address}`)

// The bundler is a special node that gets your UserOperation on chain
const bundlerClient = createBundlerClient({
 account,
 client,
 transport: http(RPC_URL),
 chain: baseSepolia,
});

// The call for your app. You will have change this depending on your dapp's abi
const nftContractAddress = "0x66519FCAee1Ed65bc9e0aCc25cCD900668D3eD49"
const mintTo = {
 abi: abi,
 functionName: "mintTo",
 to: nftContractAddress,
 args: [account.address, 1],
};
const calls = [mintTo]

// Pads the preVerificationGas (or any other gas limits you might want) to ensure your UserOperation lands onchain
account.userOperation = {
 estimateGas: async (userOperation) => {
const estimate = await bundlerClient.estimateUserOperationGas(userOperation);
// adjust preVerification upward 
estimate.preVerificationGas = estimate.preVerificationGas * 2n;
return estimate;
 },
};

// Sign and send the UserOperation
try {
 const userOpHash = await bundlerClient.sendUserOperation({
account,
calls,
paymaster: true
 });

 const receipt = await bundlerClient.waitForUserOperationReceipt({
hash: userOpHash,
 });

 console.log("✅ Transaction successfully sponsored!");
 console.log(`⛽ View sponsored UserOperation on blockscout: https://base-sepolia.blockscout.com/op/${receipt.userOpHash}`;
 console.log(`🔍 View NFT mint on basescan: https://sepolia.basescan.org/address/${account.address}`;
 process.exit
} catch (error) {
 console.log("Error sending transaction: ", error);
 process.exit(1)
}
```In your terminal you can run this script using the below command from the correct directory
#### Code```js
node index.js
```## Next steps

Modify your allowlist and gas policy to ensure you only sponsor what you want!

## Other examples

Coinbase Smart wallet examples can be found on our other quickstart guide or on [smartwallet.dev](https://smartwallet.dev/)

Examples for integrations with other common SDKs can be found here [paymaster-bundler-examples](https://github.com/coinbase/paymaster-bundler-examples/tree/master/examples)

## Troubleshooting

If you run into any errors with this tutorial, please check out our [troubleshooting guide](/paymaster/reference-troubleshooting/troubleshooting).



# Integrating Base Paymaster for Gasless Transactions in a Wagmi Project

This guide covers the steps to add Base Paymaster support for gasless transactions in an existing Wagmi project. It focuses on configuring`wagmi.ts`, adding Base-specific information, configuring the Coinbase Developer Platform (CDP), and implementing Wagmi's experimental hooks for onchain actions.

## Initial setup: Configure CDP Account

[Create](https://coinbase.com/developer-platform) a new CDP account or [sign in](https://portal.cdp.coinbase.com) to your existing account.

### Obtain Paymaster & Bundler Endpoint

In your CDP dashboard, navigate to [**Onchain Tools > Paymaster**](https://portal.cdp.coinbase.com/products/bundler-and-paymaster Then click the `Configuration`tab.

Select the chain,`Base`or`Base Sepolia`, you'd like to sponsor transactions on. Then copy the RPC URL in the **Paymaster & Bundler endpoint** section.


> Warning:
## Security

 This guide uses environment variables to store the Paymaster & Bundler endpoint obtained from cdp.portal.coinbase.com. The most secure way to do this is by using a proxy. For the purposes of this guide, the endpoint is hardcoded into our project file. For production, we highly recommend using a [proxy service](https://www.smartwallet.dev/guides/paymasters)

Add this key to your `.env`file as`NEXT_PUBLIC_CDP_PAYMASTER`or set up a [proxy service](https://www.smartwallet.dev/guides/paymasters) for production applications.

### Whitelist Contracts

In the **Contract allowlist** section, add the smart contract addresses you want to interact with using the Base Paymaster. Give each contract a name and be sure to include the specific functions as well as the contract address. Then click`Add`.


> Warning:
## WalletConnect Project ID

 Base Wallet (FKA Coinbase Smart Wallet) requires a WalletConnect project ID to work. If you don't have one, please obtain one (free) from [their website](https://cloud.reown.com/)

## Add Base to Wagmi configuration

Open your project's `wagmi.ts` to configure your project to support the Base network, WalletConnect, and Coinbase Wallet connectors:

**`wagmi.ts:`**
#### Code
```typescript
import { http, cookieStorage, createConfig, createStorage } from 'wagmi';
import { base } from 'wagmi/chains';
import { coinbaseWallet, injected, walletConnect } from 'wagmi/connectors';

export function getConfig {
 return createConfig({
chains: [base],
connectors: [
 injected,
 coinbaseWallet,
 walletConnect({ projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID }),
],
storage: createStorage({
 storage: cookieStorage,
}),
ssr: true,
transports: {
 [base.id]: http,
},
 });
}

declare module 'wagmi' {
 interface Register {
config: ReturnType<typeof getConfig>;
 }
}
```
## Implement Wagmi Hooks

For the onchain actions (minting, etc.) of your application, use Wagmi’s [experimental hooks](https://wagmi.sh/react/api/hooks/useCallsStatus#:~:text=Utilities-,Experimental,-useCallsStatus) to manage wallet connection, check for paymaster capabilities, and execute onchain actions with you whitelisted contracts.

* [**`useCapabilities`**](https://wagmi.sh/react/api/hooks/useCapabilities Retrieves the capabilities supported by the connected wallet, such as `paymasterService` for gasless transactions.
* [**`useWriteContracts`**](https://wagmi.sh/react/api/hooks/useWriteContracts Executes onchain write actions, here used to call the `mintTo` function on the NFT contract.

Here's an example for a onchain action to mint an NFT:

**`mint/page.tsx`**
#### Code
```tsx
'use client';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useState, useMemo } from 'react';
import { coinbaseWallet } from 'wagmi/connectors';
import { abi, contractAddress } from '../utils';
import { useCapabilities, useWriteContracts } from 'wagmi/experimental';

export default function MintPage {
 const { address, isConnected } = useAccount;
 const { connect } = useConnect;
 const { disconnect } = useDisconnect;
 const [isMinting, setIsMinting] = useState(false);

 // Configure `useWriteContracts`to call the mint function on the contract
 const { writeContracts } = useWriteContracts({
mutation: { onSuccess: => console.log('Mint successful') },
 });

 const handleMint = async => {
setIsMinting(true);
try {
 writeContracts({
contracts: [
 {
address: contractAddress,
abi,
functionName: 'mintTo',
args: [address],
 },
],
capabilities,
 });
} catch (error) {
 console.error('Minting failed:', error);
} finally {
 setIsMinting(false);
}
 };

 // Check for paymaster capabilities with`useCapabilities`const { data: availableCapabilities } = useCapabilities({
account: address,
 });
 const capabilities = useMemo( => {
if (!availableCapabilities || !address) return {};
const capabilitiesForChain = availableCapabilities[address.chainId];
if (
 capabilitiesForChain['paymasterService'] &&
 capabilitiesForChain['paymasterService'].supported
) {
 return {
paymasterService: {
 url:`https://api.developer.coinbase.com/rpc/v1/base/<YOUR_PAYMASTER_URL>`, //For production use proxy
},
 };
}
return {};
 }, [availableCapabilities, address]);

 return (
<div>
 <p>
{isConnected ? `Connected wallet: ${address}`: 'No wallet connected'}
 </p>
 <button
onClick={
 isConnected
? handleMint
: => connect({ connector: coinbaseWallet })
}
 >
{isMinting ? 'Minting...' : isConnected ? 'Mint NFT' : 'Connect Wallet'}
 </button>
 {isConnected && <button onClick={ => disconnect}>Disconnect</button>}
</div>
 );
}```By following these steps, you have integrated the Base Paymaster into your Wagmi project, allowing for gasless onchain interactions.

## Troubleshooting

If you run into any errors with this tutorial, please check out our [troubleshooting guide](/paymaster/reference-troubleshooting/troubleshooting).


# Build a Sponsored Transaction Component

## Overview

Gasless transactions are the future of user onboarding. When users interact with your app for the first time, they shouldn't need to pay gas just to get started. By using a Paymaster with Smart Wallets on Base, you can sponsor gas fees for onchain interactions—creating a frictionless, seamless experience for your users. In this guide, you'll learn how to build a reusable component that makes sponsored transactions possible, from allowlisting your contract to wiring up the frontend with Wagmi, Viem, and OnchainKit.

## Prerequisites

Before you get started, make sure you have the following ready:

* A deployed contract (on Base Mainnet or Base Sepolia)
* Viem v2.23.12
* Wagmi v2.14.15
* A Coinbase Developer Platform (CDP) account
* OnchainKit

<Note>
 Please use the specified versions of Wagmi and Viem for full compatibility with Base Wallet.
</Note>

## Allowlist Your Contract

To sponsor gas for your application, you first need to allowlist the contract and function you want to support.

1. Go to [https://portal.cdp.coinbase.com/
2. Navigate to **Onchain Tools > Paymaster** in the left-hand sidebar.
3. Under the **Configuration** tab, click **Enable Paymaster**, then select **Add**.
4. Input your contract address. For this example, we'll use:```0x27B535E9D8FDBCa81741e9a812Dd72656B125831```5. Specify the function signature:`startGame(uint256)`6. Click **Save** to finalize the configuration.

## Set Up Your Constants File

Let's set up a file to store important contract data.

Create a file at`app/utils/constants.ts`:
#### Code
```ts
// app/utils/constants.ts

export const GUESS_GAME_ADDRESS = '0x27B535E9D8FDBCa81741e9a812Dd72656B125831' as `0x${string}`;
export const PLAY_FEE = '0.00005';
export const PAYMASTER_URL = process.env.NEXT_PUBLIC_PAYMASTER_PROXY_SERVER_URL;
```This file holds your contract address, entry fee, and the Paymaster URL that enables gas sponsorship.

## Add the Contract ABI

We'll need the contract ABI to encode the correct function calls.

1. Create a new directory:`app/utils/abis`2. Add a file called`GuessGameABI.ts`inside it.
3. Paste the ABI you retrieved from a block explorer like Basescan or Blockscout.
#### Code```ts
// app/utils/abis/GuessGameABI.ts

export const GuessGameABI = [
 {
inputs: [{ internalType: 'uint256', name: '_playFee', type: 'uint256' }],
stateMutability: 'nonpayable',
type: 'constructor',
 },
 {
inputs: [{ internalType: 'address', name: 'owner', type: 'address' }],
name: 'OwnableInvalidOwner',
type: 'error',
 },
 {
inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
name: 'OwnableUnauthorizedAccount',
type: 'error',
 },
 // ...additional entries...
] as const;
```> Note:
You can find verified contract ABIs on [Basescan](https://basescan.org/ Navigate to the contract address, go to the **Contract** tab, and copy the ABI.

## Build the Sponsored Transaction Component

Let's build a reusable`PlayButton`component that triggers a sponsored transaction using Wagmi + Viem.

Create a new file:`app/components/PlayButton.tsx`Import the necessary modules:
#### Code```ts
import { useAccount, useSwitchChain } from 'wagmi';
import { useState } from 'react';
import { GuessGameABI } from '../utils/abis/GuessGameABI';
import { base } from 'viem/chains';
import { parseEther, encodeFunctionData } from 'viem';
import { useSendCalls } from 'wagmi/experimental';
import {
 GUESS_GAME_ADDRESS,
 PAYMASTER_URL,
 PLAY_FEE,
} from '../utils/constants';
```Set up your state and wallet connection:
#### Code```tsx
export function PlayButton({ onSuccess, finalScore }: PlayButtonProps) {
 const account = useAccount;
 const [isLoading, setIsLoading] = useState(false);
 const [error, setError] = useState<string | null>(null);
 const [success, setSuccess] = useState(false);
```Now implement the transaction logic using Wagmi's`sendCalls`:
#### Code
```ts
 const handlePlay = async => {
if (!account.isConnected) {
 setError('Please connect your wallet first');
 return;
}

if (!account.chainId || account.chainId !== base.id) {
 useSwitchChain({ chainId: base.id });
 return;
}

setIsLoading(true);
setError(null);
setSuccess(false);

try {
 const data = encodeFunctionData({
abi: GuessGameABI,
functionName: 'startGame',
 });

 await sendCalls({
calls: [
 {
to: GUESS_GAME_ADDRESS,
data,
value: parseEther(PLAY_FEE),
 },
],
capabilities: {
 paymasterService: {
url: PAYMASTER_URL,
 },
},
 });

 setSuccess(true);
} catch (err) {
 console.error('Error starting game:', err);
 setError('Failed to start game. Please try again.');
} finally {
 setIsLoading(false);
}
 };
```Render the button UI:
#### Code```tsx
 return (
<div className='w-full'>
 {error && <p className='text-red-500'>{error}</p>}
 {success && <p className='text-green-500'>Game started successfully! 🎮</p>}

 <button
onClick={handlePlay}
disabled={isLoading || !account.isConnected}
className='w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed'
 >
{isLoading ? (
 <span className='flex items-center'>
<span className='animate-spin h-5 w-5 border-b-2 border-white mr-2'></span>
Starting Game...
 </span>
) : !account.isConnected ? (
 'Connect Wallet'
) : finalScore !== undefined ? (
 'Play Again'
) : (
 'Start Game'
)}
 </button>
</div>
 );
}
```
## You're Ready!

You've now created a gasless transaction component that connects to your smart contract, handles wallet logic, and leverages the Coinbase Paymaster to sponsor transactions.

Use this setup as a foundation for other gasless interactions in your dapp. Adjust the contract address, ABI, and function calls to match your specific needs.

**Next step:** Add logic to display user progress or game state once a transaction is confirmed.

Happy building! 🚀


# Gasless Transactions on Base using Base Paymaster

> Learn how to leverage the Base Paymaster for seamless, gasless transactions on the Coinbase Cloud Developer Platform.

Base transaction fees are typically less than a penny, but the concept of gas can still be confusing for new users and lead to poor user experience when users don't have gas funds in their wallet. You can abstract this away and improve your UX by using the **Base Paymaster**. The Paymaster allows you to:

* Batch multi-step transactions
* Create custom gasless experiences
* Sponsor up to \$15k monthly on mainnet (unlimited on testnet)


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
 Smart Accounts are the backbone of advanced transaction patterns (e.g., bundling, sponsorship). If you're new to ERC 4337, check out external resources like the official [EIP-4337 explainer](https://eips.ethereum.org/EIPS/eip-4337) before starting.

3. **Foundry**\
 [Foundry] is a development environment, testing framework, and smart contract toolkit for Ethereum. You'll need it installed locally for generating key pairs and interacting with smart contracts.


> Note:
Testnet vs. Mainnet

 If you prefer not to spend real funds, you can switch to **Base Sepolia** (testnet). The steps below are conceptually the same. Just select *Base Sepolia* in the Coinbase Developer Platform instead of *Base Mainnet*, and use a contract deployed on Base testnet for your allowlisted methods.

## Set Up a Base Paymaster & Bundler

In this section, you will configure a Paymaster to sponsor payments on behalf of a specific smart contract for a specified amount.

1. **Navigate to the [Coinbase Developer Platform].**
2. Create or select your project from the upper left corner of the screen.
3. Click on the **Paymaster** tool from the left navigation.
4. Go to the **Configuration** tab and copy the **RPC URL** to your clipboard — you'll need this shortly in your code.

### Screenshots

**Select your project**

![](https://mintcdn.com/coinbase-prod/s_QeFV8SFwGVfV_u/paymaster/images/cdp-select-project.png?fit=max&auto=format&n=s_QeFV8SFwGVfV_u&q=85&s=e56dc181b3702f7621cf8dbdeaefb08b)
**Navigate to the Paymaster tool**

![](https://mintcdn.com/coinbase-prod/s_QeFV8SFwGVfV_u/paymaster/images/cdp-paymaster.png?fit=max&auto=format&n=s_QeFV8SFwGVfV_u&q=85&s=510438bf6e440365f15c8a3a65c3e494)
**Navigate to the configuration screen**

![](https://mintcdn.com/coinbase-prod/s_QeFV8SFwGVfV_u/paymaster/images/cdp-config.png?fit=max&auto=format&n=s_QeFV8SFwGVfV_u&q=85&s=c14af55f5769e2607744361caf73439e)
### Allowlist a Sponsorable Contract

1. From the Configuration page, ensure **Base Mainnet** (or **Base Sepolia** if you're testing) is selected.
2. Enable your paymaster by clicking the toggle button.
3. Click **Add** to add an allowlisted contract.
4. For this example, add [`0x83bd615eb93eE1336acA53e185b03B54fF4A17e8`][simple NFT contract], and add the function `mintTo(address)`.

![](https://mintcdn.com/coinbase-prod/s_QeFV8SFwGVfV_u/paymaster/images/cdp-allowlist-contract.png?fit=max&auto=format&n=s_QeFV8SFwGVfV_u&q=85&s=cabf2c786de0cb15f4bbf7503ad2b86b)
<Info>
 Use your own contract

 We use a [simple NFT contract][simple NFT contract] on Base mainnet as an example. Feel free to substitute your own.
</Info>

### Global & Per User Limits

Scroll down to the **Per User Limit** section. You can set:

* **Dollar amount limit** or **number of UserOperations** per user
* **Limit cycles** that reset daily, weekly, or monthly

For example, you might set:

* `max USD`to`$0.05`*`max UserOperation`to`1`This means **each user** can only have \$0.05 in sponsored gas and **1** user operation before the cycle resets.

<Info>
 Limit Cycles

 These reset based on the selected cadence (daily, weekly, monthly).
</Info>

Next, **set the Global Limit**. For example, set this to`$0.07`so that once the entire paymaster has sponsored \$0.07 worth of gas (across all users), no more sponsorship occurs unless you raise the limit.

![](https://mintcdn.com/coinbase-prod/s_QeFV8SFwGVfV_u/paymaster/images/cdp-global-user-limits.png?fit=max&auto=format&n=s_QeFV8SFwGVfV_u&q=85&s=1092001b69dda392516e3f19fc85bc3c)
## Test Your Paymaster Policy

Now let's verify that these policies work. We'll:

1. Create two local key pairs (or use private keys you own).
2. Generate two Smart Accounts.
3. Attempt to sponsor multiple transactions to see your policy in action.

### Installing Foundry

1. Ensure you have **Rust** installed
#### Command```bash
 curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```2. Install Foundry
#### Command```bash
 curl -L https://foundry.paradigm.xyz | bash
 foundryup
```3. Verify it works
#### Command```bash
 cast --help
```If you see Foundry usage info, you're good to go!

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
```You'll see something like:
#### Command```bash
 Successfully created new keypair.
 Address: 0xD440D746...
 Private key: 0x01c9720c1dfa3c9...
```**Store these private keys somewhere safe**

### Project Structure With Environment Variables

Create a`.env`file in the`sponsored_transactions`directory. In the`.env`, you'll add the rpcURL for your paymaster and the private keys for your accounts:

<Info>
 \[Find your Paymaster & Bundler endpoint]

 The Paymaster & Bundler endpoint is the URL for your Coinbase Developer Platform (CDP) Paymaster.
 This was saved in the previous section and follows this format: `https://api.developer.coinbase.com/rpc/v1/base/<SPECIAL-KEY>`Navigate to the [Paymaster Tool] and select the`Configuration`tab at the top of the screen to obtain your RPC URL.
</Info>


> Warning:
\[Secure your endpoints]

 You will create a constant for our Paymaster & Bundler endpoint obtained from cdp.portal.coinbase.com. The most secure way to do this is by using a proxy. For the purposes of this demo, hardcode it into our`index.js`file. For product, we highly recommend using a [proxy service].
#### Command```bash
PAYMASTER_RPC_URL=https://api.developer.coinbase.com/rpc/v1/base/<SPECIAL-KEY>
PRIVATE_KEY_1=0x01c9720c1dfa3c9...
PRIVATE_KEY_2=0xbcd6fbc1dfa3c9...
```> Warning:
Never commit`.env`files to a public repo!

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
 // For variety, let's also mint to the second account's own address
 await sendTransaction(smartAccountClient2, smartAccountClient2.account.address);
});
```Now that the code is implemented, lets run it:
Run this via`node index.js`from your project root.
#### Command```bash
node index.js
```You should see a "Transaction successfully sponsored" output.

To confirm that your spend policies are correctly in place, try running the script again. If your Paymaster settings are strict (e.g., limit 1 transaction per user), the second time you run the script, you may get a "request denied" error, indicating the policy is working.

## Hitting Policy Limits & Troubleshooting

1. **Per-User Limit**\
 If you see an error like:
#### JSON```json
 {
 "code": -32001,
 "message": "request denied - rejected due to maximum per address transaction count reached"
 }
```That means you've hit your **UserOperation** limit for a single account. Return to the [Coinbase Developer Platform] UI to adjust the policy.

2. **Global Limit**\
 If you repeatedly run transactions and eventually see:
#### JSON```json
 {
 "code": -32001,
 "message": "request denied - rejected due to max global usd spend limit reached"
 }
```You've hit the **global** limit of sponsored gas. Increase it in the CDP dashboard and wait a few minutes for changes to take effect.

## Verifying Token Ownership (Optional)

Want to confirm the token actually minted? You can read the NFT's`balanceOf`function:
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
```
## Conclusion

In this tutorial, you:

* Set up and **configured** a Base Paymaster on the Coinbase Developer Platform.
* **Allowlisted** a contract and specific function (`mintTo`) for sponsorship.
* Established **per-user** and **global** sponsorship **limits** to control costs.
* Demonstrated the **sponsorship flow** with Smart Accounts using `permissionless`, `viem`, and Foundry-generated private keys.

This approach can greatly improve your onchain app's user experience by removing gas friction. For more complex sponsorship schemes (like daily or weekly cycles), simply tweak your per-user and global limit settings in the Coinbase Developer Platform.

> **Next Steps**
>
> * Use a [proxy service][proxy service] for better endpoint security.
> * Deploy your own contracts and allowlist them.
> * Experiment with bundling multiple calls into a single sponsored transaction.


[CDP site]: https://portal.cdp.coinbase.com/

[Coinbase Developer Platform]: https://portal.cdp.coinbase.com/

[proxy service]: https://www.smartwallet.dev/guides/paymasters

[Paymaster Tool]: https://portal.cdp.coinbase.com/products/bundler-and-paymaster

[Foundry]: https://book.getfoundry.sh/getting-started/installation

[simple NFT contract]: https://basescan.org/token/0x83bd615eb93ee1336aca53e185b03b54ff4a17e8

**Happy Building on Base!**


# Creating a Paymaster Proxy for Secured Sponsored Transactions

One of the biggest UX enhancements unlocked by Smart Wallet is the ability for app developers to sponsor their users' transactions. If your app supports Smart Wallet, you can start sponsoring your users' transactions by using [standardized paymaster service communication](https://erc7677.xyz) enabled by [new wallet RPC methods](https://eip5792.xyz)

The code below is also in our [Wagmi Smart Wallet template](https://github.com/wilsoncusack/wagmi-scw/)

**About The Hooks Used Below**

The `useWriteContracts`and`useCapabilities`hooks used below rely on new wallet RPC and are not yet supported in most wallets.
It is recommended to have a fallback function if your app supports wallets other than Smart Wallet.

## Using Wagmi/Viem in a Next.js app

### Choose a paymaster service provider

As a prerequisite, you'll need to obtain a paymaster service URL from a paymaster service provider.

We recommend the [Coinbase Developer Platform](https://www.coinbase.com/developer-platform) paymaster,
currently offering up to \$15k in gas credits as part of the Base Gasless Campaign.
Once you have signed up for Coinbase Developer Platform, you get your Paymaster service URL by navigating to Onchain Tools > Paymaster as shown below:

![](https://mintcdn.com/coinbase-prod/s_QeFV8SFwGVfV_u/paymaster/images/PaymasterCDP.png?fit=max&auto=format&n=s_QeFV8SFwGVfV_u&q=85&s=3809d864692e6edd875740bbd1181f24)
Once you choose a paymaster service provider and obtain a paymaster service URL, you can proceed to integration.

**ERC-7677-Compliant Paymaster Providers**

To be compatible with Smart Wallet, the paymaster provider you choose must be [ERC-7677-compliant](https://www.erc7677.xyz/ecosystem/paymasters)

### Validate UserOperation

The policies on many paymaster services are quite simple and limited. As your API will be exposed on the web,
you want to make sure in cannot abused: called to sponsor transaction you do not want to fund. The checks below
are a bit tedious, but highly recommended to be safe. See "Trust and Validation" [BynRsX7Ca](https://hackmd.io/@AhweV9sISeevhvrtVPCGDw/BynRsX7Ca#Trust-and-Validation)
for more on this.

The goal of this section is to write a`willSponsor`function to add some extra validation if needed.

<Info>
 \[Simplifying willSponsor with Allowlisting]`willSponsor`can be simplified or removed entirely if your paymaster service supports allowlisting which
 contracts and function calls should be sponsored. [Coinbase Developer Platform](https://www.coinbase.com/developer-platform) supports this.
</Info>

The code below is built specifically for Smart Wallet. It would need to be updated to support other smart accounts.
#### Code```ts
// @errors: 2305
// @noErrors
import { UserOperation } from "viem/account-abstraction";
import { entryPoint06Address } from "viem/account-abstraction";
import {
 Address,
 BlockTag,
 Hex,
 decodeAbiParameters,
 decodeFunctionData,
} from "viem";
import { baseSepolia } from "viem/chains";
import { client } from "./config";
import {
 coinbaseSmartWalletABI,
 coinbaseSmartWalletProxyBytecode,
 coinbaseSmartWalletV1Implementation,
 erc1967ProxyImplementationSlot,
 magicSpendAddress,
} from "./constants";
import { myNFTABI, myNFTAddress } from "@/ABIs/myNFT";

// @noErrors 

export async function willSponsor({
 chainId,
 entrypoint,
 userOp,
}: { chainId: number; entrypoint: string; userOp: UserOperation<'0.6'> }) {
 // check chain id
 if (chainId !== baseSepolia.id) return false;
 // check entrypoint
 // not strictly needed given below check on implementation address, but leaving as example
 if (entrypoint.toLowerCase !== entryPoint06Address.toLowerCase)
return false;

 try {
// check the userOp.sender is a proxy with the expected bytecode
const code = await client.getBytecode({ address: userOp.sender });
if (code != coinbaseSmartWalletProxyBytecode) return false;

// check that userOp.sender proxies to expected implementation
const implementation = await client.request<{
 Parameters: [Address, Hex, BlockTag];
 ReturnType: Hex;
}>({
 method: "eth_getStorageAt",
 params: [userOp.sender, erc1967ProxyImplementationSlot, "latest"],
});
const implementationAddress = decodeAbiParameters(
 [{ type: "address" }],
 implementation,
)[0];
if (implementationAddress != coinbaseSmartWalletV1Implementation)
 return false;

// check that userOp.callData is making a call we want to sponsor
const calldata = decodeFunctionData({
 abi: coinbaseSmartWalletABI,
 data: userOp.callData,
});

// keys.coinbase.com always uses executeBatch
if (calldata.functionName !== "executeBatch") return false;
if (!calldata.args || calldata.args.length == 0) return false;

const calls = calldata.args[0] as {
 target: Address;
 value: bigint;
 data: Hex;
}[];
// modify if want to allow batch calls to your contract
if (calls.length > 2) return false;

let callToCheckIndex = 0;
if (calls.length > 1) {
 // if there is more than one call, check if the first is a magic spend call
 if (calls[0].target.toLowerCase !== magicSpendAddress.toLowerCase)
return false;
 callToCheckIndex = 1;
}

if (
 calls[callToCheckIndex].target.toLowerCase !==
 myNFTAddress.toLowerCase
)
 return false;

const innerCalldata = decodeFunctionData({
 abi: myNFTABI,
 data: calls[callToCheckIndex].data,
});
if (innerCalldata.functionName !== "safeMint") return false;

return true;
 } catch (e) {
console.error(`willSponsor check failed: ${e}`);
return false;
 }
}
```#### Code```ts
export const coinbaseSmartWalletProxyBytecode =
 "0x363d3d373d3d363d7f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc545af43d6000803e6038573d6000fd5b3d6000f3";
export const coinbaseSmartWalletV1Implementation =
 "0x000100abaad02f1cfC8Bbe32bD5a564817339E72";
export const magicSpendAddress = "0x011A61C07DbF256A68256B1cB51A5e246730aB92";
export const erc1967ProxyImplementationSlot =
 "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";

export const coinbaseSmartWalletABI = [
 {
type: "function",
name: "executeBatch",
inputs: [
 {
name: "calls",
type: "tuple[]",
internalType: "struct CoinbaseSmartWallet.Call[]",
components: [
 {
name: "target",
type: "address",
internalType: "address",
 },
 {
name: "value",
type: "uint256",
internalType: "uint256",
 },
 {
name: "data",
type: "bytes",
internalType: "bytes",
 },
],
 },
],
outputs: [],
stateMutability: "payable",
 },
];
```#### Code```ts
export const myNFTABI = [
 {
stateMutability: "nonpayable",
type: "function",
inputs: [{ name: "to", type: "address" }],
name: "safeMint",
outputs: [],
 },
] as const;

export const myNFTAddress = "0x119Ea671030FBf79AB93b436D2E20af6ea469a19";
```#### Code```ts
import { createClient, createPublicClient, http } from "viem";
import { baseSepolia } from "viem/chains";
import { entryPoint06Address, createPaymasterClient, createBundlerClient } from "viem/account-abstraction";

export const client = createPublicClient({
 chain: baseSepolia,
 transport: http,
});

const paymasterService = process.env.PAYMASTER_SERVICE_URL!;

export const paymasterClient = createPaymasterClient({
 transport: http(paymasterService),
});

export const bundlerClient = createBundlerClient({
 chain: baseSepolia,
 paymaster: paymasterClient, 
 transport: http(paymasterService),
})
```<Info>
 Protect Your Paymaster Service URL

 As you can see in the Paymaster transaction [component](https://github.com/wilsoncusack/wagmi-scw/blob/main/src/components/TransactWithPaymaster.tsx)
 we use a proxy to protect the paymaster service URL, because it is exposed on the client side.
</Info>

For local development, you can use the same URL for the paymaster service and the proxy.

We also created a [minimalist proxy API](https://github.com/wilsoncusack/wagmi-scw/blob/main/src/app/api/paymaster/route.ts)
which you can use as the`paymasterServiceUrl` in the [`TransactWithPaymaster`component](https://github.com/wilsoncusack/wagmi-scw/blob/main/src/components/TransactWithPaymaster.tsx)

### Send EIP-5792 requests with a paymaster service capability

Once you have your paymaster service set up, you can now pass its URL along to Wagmi's`useWriteContracts`hook.


> Note:
## Using Your Proxy URL

 If you set up a proxy in your app's backend as recommended in step (2) above, you'll want to pass in the proxy URL you created.
#### Code```ts
// @noErrors
import { useAccount } from "wagmi";
import { useCapabilities, useWriteContracts } from "wagmi/experimental";
import { useMemo, useState } from "react";
import { CallStatus } from "./CallStatus";
import { myNFTABI, myNFTAddress } from "./myNFT";

export function App {
 const account = useAccount;
 const [id, setId] = useState<string | undefined>(undefined);
 const { writeContracts } = useWriteContracts({
mutation: { onSuccess: (id) => setId(id) },
 });
 const { data: availableCapabilities } = useCapabilities({
account: account.address,
 });
 const capabilities = useMemo( => {
if (!availableCapabilities || !account.chainId) return {};
const capabilitiesForChain = availableCapabilities[account.chainId];
if (
 capabilitiesForChain["paymasterService"] &&
 capabilitiesForChain["paymasterService"].supported
) {
 return {
const paymasterServiceUrl = process.env.NEXT_PUBLIC_PAYMASTER_PROXY_SERVER_URL
paymasterService: {
 url: paymasterServiceUrl // You can also use the minimalist proxy we created: `${document.location.origin}/api/paymaster`},
 };
}
return {};
 }, [availableCapabilities, account.chainId]);

 return (
<div>
 <h2>Transact With Paymaster</h2>
 <p>{JSON.stringify(capabilities)}</p>
 <div>
<button
 onClick={ => {
writeContracts({
 contracts: [
 {
 address: myNFTAddress,
 abi: myNFTABI,
 functionName: "safeMint",
 args: [account.address],
 },
 ],
 capabilities,
});
 }}
>
 Mint
</button>
{id && <CallStatus id={id} />}
 </div>
</div>
 );
}```#### Code```ts
export const myNFTABI = [
 {
stateMutability: "nonpayable",
type: "function",
inputs: [{ name: "to", type: "address" }],
name: "safeMint",
outputs: [],
 },
] as const;

export const myNFTAddress = "0x119Ea671030FBf79AB93b436D2E20af6ea469a19";
```
**How to find this code in the repository?**

The code above is a simplified version of the code in the
[template](https://github.com/wilsoncusack/wagmi-scw/)

In the template, we create a [`TransactWithPaymaster`](https://github.com/wilsoncusack/wagmi-scw/blob/main/src/components/TransactWithPaymaster.tsx) component that uses the `useWriteContracts` hook to send a transaction with a paymaster.

The [`TransactWithPaymaster`](https://github.com/wilsoncusack/wagmi-scw/blob/main/src/components/TransactWithPaymaster.tsx) component is used in the [`page.tsx`](https://github.com/wilsoncusack/wagmi-scw/blob/main/src/app/page.tsx) file.

That's it! Smart Wallet will handle the rest. If your paymaster service is able to sponsor the transaction,
in the UI Smart Wallet will indicate to your user that the transaction is sponsored.

https://github.com/coinbase/paymaster-bundler-examples/tree/master/examples


# Paymaster & Bundler Errors

Learn about Paymaster & Bundler error codes and how to resolve them.

If the error you're encountering persists, please join the Coinbase Developer Platform Discord and contact us in `#paymaster`for assistance.

## Paymaster Error Codes

Below are a list of common error codes returned by the Paymaster.

| Error | Code | Description |
| :--------------------- | :----- | :--------------------------------------------------------------------------------------------------------------------------------- |
| INTERNAL\_ERROR | -32000 | Internal error. Something is wrong with our service. Please contact support if this persists. |
| UNAUTHORIZED\_ERROR | -32001 | Unauthorized. Check if your API key and RPC URL are valid. |
| DENIED\_ERROR | -32001 | Request denied. This may be due to the gas policy you configured in the Paymaster page. Check the values in your gas policy. |
| UNAVAILABLE\_ERROR | -32003 | Service unavailable. Please contact support if this persists. |
| GAS\_ESTIMATION\_ERROR | -32004 | An error occurred during eth\_estimateUserOperation. This is typically due to insufficient gas, or an invalid paymaster signature. |
| METHOD\_NOT\_FOUND | -32601 | Method not found. Check if Paymaster is enabled on your RPC URL, and if you're sending the correct JSON-RPC method. |
| INVALID\_ARGUMENT | -32602 | Invalid argument. Ensure you have the correct parameters in the UserOperation. |
| PARSE\_ERROR | -32700 | Parse error. Ensure you have the correct parameters in the UserOperation, and that the request body is formatted properly. |

## Paymaster Gas Policy Errors

| Message | Description |
| :------------------------------------------------------------ | :---------------------------------------------------------------- |
| rejected due to max per user op spend limit exceeded | UserOperation cost too large - configure Per UserOperation limit. |
| rejected due to max monthly org spend limit | over max monthly spend - contact us to increase your limit. |
| rejected due to max global usd spend limit reached | over configured max total USD - adjust your policy. |
| rejected due to maximum per address transaction count reached | per sender address maximum number of txn sponsored reached. |
| rejected due to maximum per address sponsorship reached | per sender address maximum USD sponsorship reached. |
| attestation not found for address | sender address does not have required attestation. |
| target address not in allowed contracts | contract allowlist - invalid address called. |
| method not in allowed methods | contract allowlist - wrong method called on allowed contract. |

## Bundler Error Codes

Below are a list of common error codes returned by the Bundler. These will typically be accompanied by an Entrypoint Error Code (defined below).

| Error | Code | Description |
| :---------------------------- | :----- | :------------------------------------------------- |
| REJECTED\_BY\_EP\_OR\_ACCOUNT | -32500 | The transaction was rejected by the EP or account. |
| REJECTED\_BY\_PAYMASTER | -32501 | The transaction was rejected by the Paymaster. |
| BANNED\_OPCODE | -32502 | The transaction contains a banned opcode. |
| SHORT\_DEADLINE | -32503 | The transaction deadline is too short. |
| BANNED\_OR\_THROTTLED\_ENTITY | -32504 | The entity is banned or throttled. |
| INVALID\_ENTITY\_STAKE | -32505 | The entity stake is invalid. |
| INVALID\_AGGREGATOR | -32506 | The aggregator is invalid. |
| INVALID\_SIGNATURE | -32507 | The transaction signature is invalid. |
| EXECUTION\_REVERTED | -32521 | The transaction execution was reverted. |
| INVALID\_FIELDS | -32602 | The transaction contains invalid fields. |

## Entrypoint Error Codes

Below are a list of common error codes returned by the Entry Point.

| Error | Description |
| :------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AA10 sender already constructed | The sender was already created, so initCode should be empty. Remove the initCode. |
| AA13 initCode failed or OOG | The initCode failed to create the account or ran out of gas. Additionally, check the verificationGasLimit field in your UserOperation. |
| AA14 initCode must return sender | The initCode fails to provide the sender address. Verify either the initCode or the factory contract for potential issues. |
| AA15 initCode must create sender | The initCode within the UserOperation fails to generate an account. Please inspect the initCode or the factory contract for potential issues. |
| AA20 Account not deployed | The smart account has not been deployed, and no initCode was specified. If this is the initial transaction for this account, ensure that an initCode is included. |
| AA21 didn’t pay prefund | The transaction was rejected by the EP or account. Check that the account has enough ETH to pay for the UserOperation, or that the Paymaster is configured properly. |
| AA23 reverted (or OOG) | The signature of the UserOperation was rejected or ran out of gas. Check if you have sufficient ETH for gas, or that the Paymaster is configured properly. |
| AA24 Signature error | The signature of the UserOperation is invalid. Check that the UserOperation hash, entrypoint address, and chain ID are correct. |
| AA25 Invalid account nonce | The nonce is invalid. The UserOperation is using an old nonce, or the nonce is improperly formatted. |
| AA40 Over verification gas limit | The verification gas limit has been surpassed. Check the verificationGasLimit field in your UserOperation. |
| AA41 Too little verification gas | Verifying the UserOperation did not complete due to insufficient gas. You may need to increase verificationGasLimit. |
| AA50 PostOp reverted | The execution of additional logic by the EntryPoint resulted in a revert. |
| AA51 prefund below actualGasCost | The actual cost of the UserOperation is higher than the total amount of gas approved. |

## Request Logs

Request Logs for UserOps can be downloaded under the Logs tab on the Paymaster page. These logs are useful for debugging errors or auditing sponsored UserOps. Click on`Download CSV`to download a CSV of successful and failed requests.

| Column | Description |
| :-------------- | :--------------------------------------------------------------------------------------- |
| OrganizationId | ID of your Cloud Developer Platform Organization. |
| ProjectId | ID of your Cloud Developer Platform Project. |
| Network | Network for the request. Either base or base-sepolia. |
| Status | Status of the request. Either completed, in progress or failed. |
| UserOpHash | Hash of the UserOperation. |
| Sender | Account making the UserOperation. |
| Paymaster | Contract/service that sponsors UserOperation gas (making transactions free to end user). |
| TransactionHash | Transaction hash that the UserOperation was included in. |
| GasCost | Cost of gas in Gwei. |
| GasUsed | Amount of gas used \* the gas cost. |
| Method | Method called by the request. |
| ErrorCode | Error code for failed requests. |
| ErrorMessage | Error message for failed requests. |



# Paymaster & Bundler Troubleshooting

This tutorial explains how to debug common issues you may face when sending UserOperations.

## Execution reverted

The UserOperation was able to make it onchain, but an error occurred in one of the smart contracts it interacted with, and thus the entire operation had to be reverted. This can be due to

* Not enough gas to pay for execution
 * Try increasing the`preVerificationGas`or`callGasLimit`padding
* An issue with the`callData`of your UserOperations
 * This is an issue with your dapp's smart contract, which you will need to debug.

You can use a tool like [Tenderly](https://dashboard.tenderly.co/) to help simulate and debug the UserOperation.

### Issue regarding gas estimation

If you think the issue may be related to gas, simulate using the Entrypoint contract,`0x5ff137d4b0fdcd49dca30c7cf57e578a026d2789`, and pasting in your UserOperation into the `tuple`field.

For example, your UserOperation may look something like```{
 "callData": "0xb61d27f600000000000000000000000066519fcaee1ed65bc9e0acc25ccd900668d3ed490000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000443f84ac0e0000000000000000000000001e3143e0ed8c0ea51f1551b6c355e02f3e0baae0000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000",
 "paymasterAndData": "0xc484bcd10ab8ad132843872deb1a0adc1473189c000066cd03db0000000000000098973f00000a968163f0a57b400000018633de6cf5e53752c5eac49e8f8ffb4ecd16b2afe7b4074086d6693536a9ab1f117bae0b427f83f94246c34d25add97b05e8a73859c2dceef6ee730ab2842bf31b",
 "sender": "0x1e3143E0ED8C0Ea51F1551B6c355e02f3e0bAae0",
 "initCode": "0x",
 "maxFeePerGas": "3000000000",
 "maxPriorityFeePerGas": "1000000000",
 "nonce": "31815307923431762811356398485504",
 "signature": "0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000041ca7a742cff01aa9d5e377c5a146b5d8f03a4e44bd1817b1899bf7e0ff6885ed63294c69f017fe47f385c046055cc687e503bba08513ff52fbf21dcd8019c1f1d1b00000000000000000000000000000000000000000000000000000000000000",
 "callGasLimit": "257565",
 "preVerificationGas": "96024",
 "verificationGasLimit": "87888"
}```You can use the`simulateHandleOp`function and pass that UserOperation in the`op`field (don't forget to add array brackets around it, because technically it handles a "bundle" of UserOperations).


 ![](https://mintcdn.com/coinbase-prod/s_QeFV8SFwGVfV_u/paymaster/images/pb-paymaster-tenderly-entrypoint.png?fit=max&auto=format&n=s_QeFV8SFwGVfV_u&q=85&s=41b481bd2c828c215a14e9f7949d6acb)


### Execution reverted with data

Error may look something like this```cause: {
 "code": -32004,
 "message": " - execution reverted with data",
 "data": "0xed6c3dec00000000000000000000000036e53f56454e1206f775dafe2b33c1b737c43632"
}```You can use a tool like [https://bia.is/tools/abi-decoder/ to upload your ABI, enter the data in, and decode the error message. Try using the ABI of every smart contract your dapp could be interacting with.

### Execution reverted for an unknown reason

Similar to above, except your contract is reverting without any error codes. Try reviewing your smart contract's code, your`callData`, and using [Tenderly](https://dashboard.tenderly.co/) to debug. It may help to have your [contract verified.](https://book.getfoundry.sh/reference/forge/forge-verify-contract)

The example below shows you how to debug your own smart contract.

* `Insert any address`- Enter your smart contract's address here
*`Enter raw input data`- Enter the`callData`of your contract's function (right after`callData = encodeFunctionData`)


 ![](https://mintcdn.com/coinbase-prod/s_QeFV8SFwGVfV_u/paymaster/images/pb-paymaster-tenderly-dev-debug.png?fit=max&auto=format&n=s_QeFV8SFwGVfV_u&q=85&s=9048f07e28807bc2498d57dabbd59a6a)


## Invalid chain id

You might be using the mainnet RPC url instead of the testnet RPC url (or vis versa). Make sure you select the right network in the CDP portal


 ![](https://mintcdn.com/coinbase-prod/s_QeFV8SFwGVfV_u/paymaster/images/pb-paymaster-chainid.png?fit=max&auto=format&n=s_QeFV8SFwGVfV_u&q=85&s=65916bdcc1515aaa52c25987108a43c3)


## Invalid UserOperation signature or paymaster signature
```UserOperation rejected because account signature check failed (or paymaster signature, if the paymaster uses its data as signature).```This likely means that you updated the UserOperation after getting a signature from our Paymaster service. Our Paymaster signs the UserOperation with the UserOperation itself, so make sure you're not making any changes to the UserOperation after it's already been signed by our Paymaster`paymasterClient.getPaymasterData`. If you need to adjust things like `callData`, `preVerificationGas`, or `callGasLimit`, you will need to receive a new signature from our Paymaster. Also if you're handling multiple UserOperation, make sure the paymaster signature matches the right UserOperation.


# Paymaster Security

It is important to understand where you are using your Paymaster endpoint as anyone who has your key can send requests to sponsor transactions.

We strongly recommend setting up a contract allowlist on your paymaster configuration which will lock down your paymaster to only sponsor transactions on your wallet.

Further security measures such as setting up a paymaster Proxy so that your api key is not leaked is also recommended.

If you are in a situation where you can not add a contract allowlist due to dynamic calls to contracts that are not on policy then you must set up a paymaster proxy on your backend such that your api token does not get leaked.

Set sponsorship limits to further ensure you're only sponsoring what you want to.

## Paymaster Proxy

Creating an API to proxy calls to your paymaster service is important for two reasons.

* Allows you to protect any API secret.
* Allows you to add extra validation on what requests you want to sponsor.

You can see more details on implementing a paymaster proxy at [smartwallet.dev](https://www.smartwallet.dev/guides/paymasters)





## DATA

## Getting Started

# Welcome to Onchain Data

## Overview

Coinbase Developer Platform's (CDP) Onchain Data provides enterprise-grade tools to read, query, and monitor blockchain data. Get millisecond-latency access to live onchain data without managing complex infrastructure.


- [Try it now: Quickstart](/data/get-started/quickstart)


## Key features

* **Ultra-low latency:** Sub-500ms response times with data \<250ms from chain tip
* **Enterprise-grade reliability:** Production-ready infrastructure built on Coinbase's institutional-grade systems
* **Real-time updates:** Instant notifications via webhooks with guaranteed delivery and retry logic
* **Zero infrastructure:** No nodes to run, no databases to maintain, no DevOps overhead
* **Rich data coverage:** Token balances, wallet history, and more
* **Easy integration:** Simple REST APIs and comprehensive SDKs in TypeScript, Python, Go, and Rust

## Use cases

CDP Onchain Data powers real-time applications across DeFi, NFTs, gaming, and more:

* **DeFi dashboards** - Track token prices, liquidity pools, and trading volumes in real-time
* **NFT marketplaces** - Index collections, monitor transfers, and display ownership history
* **Wallet analytics** - Analyze transaction patterns and token holdings
* **Real-time alerts** - Get notified instantly when onchain events occur
* **Trading bots** - React to market changes with sub-second data freshness

## Demo applications

See CDP Data in action with working examples:


 
- [Wallet History Dashboard](/get-started/demo-apps/app-examples/wallet-history)


 
- [Transaction History Downloader](/get-started/demo-apps/app-examples/transaction-history-downloader)



## Available services


 
- [SQL API](/data/sql-api/welcome)


 
- [Node](/data/node/overview)


 
- [Webhooks](/data/webhooks/welcome)


 
- [Token Balances API](/data/token-balance/welcome)


 
- [Address History API](/data/wallet-history/overview)




# Onchain Data: Quickstart

export const SqlPlaygroundQuickstart = => {
 return <>
 <p>Use our SQL API to query onchain data in milliseconds. With SQL API, you can:</p>
 <ul>
 <li>Query <strong>transactions, events, blocks, and transfers</strong> across Base with <strong>&lt; 500ms latency</strong></li>
 <li>Join data across tables for complex analytics</li>
 <li>Track token flows, smart contract activity, and wallet behavior</li>
 </ul>
 <p>The fastest way to query onchain data is through the <strong>SQL Playground</strong> in CDP Portal.</p>
 
### Step: Open SQL Playground
Navigate to the <a href="https://portal.cdp.coinbase.com/products/data/playground>SQL Playground</a> in Portal.
 
### Step: Try a query
Copy this query to see recent USDC transfers on Base:

 <CodeBlock language="sql">
{`SELECT 
 parameters['from'] AS sender,
 parameters['to'] AS to,
 parameters['value'] AS amount,
 address AS token_address
FROM base.events
WHERE 
 event_signature = 'Transfer(address,address,uint256)'
 AND address = '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913'
LIMIT 10;`}
 </CodeBlock>

 See results in milliseconds! ⚡
 
 ![](/data/images/sql-playground-quickstart-query.png)
 </>;
};

export const NodePlaygroundQuickstart = => {
 return <>
 <p>CDP Node provides free RPC endpoints for Base. With Node, you can:</p>
 <ul>
 <li>Read blockchain state (blocks, transactions, balances, smart contract data)</li>
 <li>Send transactions to the network</li>
 <li>Monitor events and subscribe to logs</li>
 <li>Call smart contracts on Base</li>
 </ul>
 <p>Let's make your first blockchain call using the <strong>Node Playground</strong> in CDP Portal.</p>
 
### Step: Open Node Playground
Navigate to <a href="https://portal.cdp.coinbase.com/products/node>Node</a> in Portal.
 
### Step: Run the RPC call
The playground has a prefilled <code>eth_blockNumber</code> call. Click <strong>Run</strong> to get the current block number on Base.

 See results in milliseconds! ⚡

 ![](/data/images/node-playground-rpc-call.png)
 </>;
};

## Overview

Experience Coinbase Developer Platform's (CDP) onchain data tools in just a few minutes. No SDK installation, no complex authentication -- just instant access to live blockchain data.

In this guide, you will:

* Query live blockchain data through our SQL Playground
* Make your first RPC call to Base through our Node Playground

## Prerequisites

* A free [CDP account](https://portal.cdp.coinbase.com/)

That's it! No API keys needed!

## 1. Run a SQL query

<SqlPlaygroundQuickstart />

## 2. Make your first RPC call

<NodePlaygroundQuickstart />

## What to read next


 
- [SQL Schema](/data/sql-api/schema)


 
- [SQL API Reference](/data/sql-api/rest-apis)


 
- [RPC Methods](/data/node/api-reference/core-evm-methods)


 
- [Token Balances API](/data/token-balance/welcome)


 
- [Webhooks](/data/webhooks/welcome)


 
- [Address History API](/data/address-history/overview)




# Onchain Data FAQ

### What networks are supported?

Network support varies by product. See the [Supported Networks](/get-started/supported-networks) page for a complete breakdown of which networks each Data product supports.

### What is the rate limit?

The default rate limit is **100 requests per second** at both IP and project level. Contact us if you need higher limits.

### Do I need API keys?

* **Browser playgrounds** (SQL Playground, Node Playground): No API keys needed
* **REST APIs and SDK**: Yes, create free API keys in [CDP Portal](https://portal.cdp.coinbase.com/)

### How fresh is the data?

* **SQL API**: \< 500ms latency with data \< 250ms from chain tip
* **Node RPC**: Real-time access to the latest block
* **Webhooks**: \< 500ms end-to-end notification delivery

### How much does it cost?

CDP Onchain Data offers a **free tier** with 100 requests/second. For higher limits and enterprise features, contact us in CDP Discord **#onchain-data** channel.

### Where can I get help?

Join **#onchain-data** in the CDP Discord to connect with our team and other developers.


## Node

Welcome to Node

# Welcome to Node

## Overview

To read blockchain data (like balances or transactions) or write to it (like deploying contracts), you need a connection to a blockchain node. **Node** provides free blockchain access for developers building on [Base](https://base.org/ giving you instant RPC access without running your own infrastructure.

Think of it as a direct line to the Base blockchain. You make requests, and Node handles all the complexity of connecting to and querying the network.


- [Try it now: Quickstart](/data/node/quickstart)



 
- [Core EVM Methods](/api-reference/json-rpc-api/core)


 
- [Paymaster Methods](/api-reference/json-rpc-api/paymaster)


 
- [Wallet History](/api-reference/json-rpc-api/wallet-history)



## Key features

* **Free blockchain access:** Connect to Base Mainnet and Sepolia testnet at no cost with generous rate limits
* **No infrastructure to manage:** Skip the complexity of running your own blockchain node—just use our endpoints
* **Standard Ethereum methods:** Works with any Ethereum-compatible tools and libraries you already know, like `ethers.js`and Viem
* **Bonus features included:** Get extra capabilities like gas sponsorship (Paymaster) and wallet history queries built right in

## Use cases

* **Build DeFi apps:** Create trading interfaces, lending platforms, or dashboards that display live blockchain data
* **Create NFT platforms:** Build marketplaces that show who owns which NFTs and track their transfer history
* **Develop wallet apps:** Display user balances, show transaction history, and send transactions on behalf of users
* **Deploy smart contracts:** Upload your contracts to Base and interact with them programmatically

## Supported networks

Currently available on:

* **Base Mainnet** - Production environment for live applications
* **Base Sepolia** - Testnet for development and testing

Base is a secure, low-cost, builder-friendly Ethereum L2 built to bring the next billion users onchain. [Learn more about Base](https://docs.base.org/)

## Getting started

Ready to connect to Base? Our quickstart guide walks you through everything step-by-step—from trying Node in the browser playground to making your first programmatic request with code examples in multiple languages.


- [Start building: Quickstart](/data/node/quickstart)


## Rate limits

Free users are rate limited to **7500 API credits every 5 seconds per project**. Each JSON-RPC method uses an assigned amount of API credits per call. The average JSON-RPC call uses 30 API credits, so expect approximately **50 requests per second** maximum.

**Need higher limits?** Builders get a free rate limit increase. Join our Node Discord channel to request a bumped limit.

<Info>
 CDP currently doesn't have a paid tier for RPC Node. All increases are provided to builders at no cost.
</Info>

## API Reference

When you're ready to build, explore the available methods:

* **[Core EVM Methods](/api-reference/json-rpc-api/core)** - Standard Ethereum JSON-RPC methods ([full spec](https://ethereum.org/en/developers/docs/apis/json-rpc/#json-rpc-methods)
* **[Paymaster Methods](/api-reference/json-rpc-api/paymaster)** - Sponsor gas fees for your users
* **[Wallet History Methods](/api-reference/json-rpc-api/wallet-history)** - Query historical wallet data

## Support and feedback

* **CDP Discord**: Join #node for support and to request rate limit increases


# Node Quickstart

export const NodePlaygroundQuickstart = => {
 return <>
 <p>CDP Node provides free RPC endpoints for Base. With Node, you can:</p>
 <ul>
 <li>Read blockchain state (blocks, transactions, balances, smart contract data)</li>
 <li>Send transactions to the network</li>
 <li>Monitor events and subscribe to logs</li>
 <li>Call smart contracts on Base</li>
 </ul>
 <p>Let's make your first blockchain call using the <strong>Node Playground</strong> in CDP Portal.</p>
 
### Step: Open Node Playground
Navigate to <a href="https://portal.cdp.coinbase.com/products/node>Node</a> in Portal.
 
### Step: Run the RPC call
The playground has a prefilled <code>eth_blockNumber</code> call. Click <strong>Run</strong> to get the current block number on Base.

 See results in milliseconds! ⚡

 ![](/data/images/node-playground-rpc-call.png)
 </>;
};

Get started with CDP Node in minutes. This guide shows you how to get your RPC endpoint and make your first blockchain request—both in the browser playground and programmatically in your code.

## Prerequisites

* A free [CDP account](https://portal.cdp.coinbase.com/)

That's it! No complex setup, no infrastructure to manage.

## 1. Try it in the playground

<NodePlaygroundQuickstart />

## 2. Get your RPC endpoint

To use Node in your application, you need an **RPC endpoint URL**. This is the web address where you send blockchain requests—think of it like an API endpoint, but specifically for blockchain operations.


### Step: Navigate to Node
Go to the [Node page](https://portal.cdp.coinbase.com/products/node) in CDP Portal.
 
### Step: Select your network
Choose your target network from the dropdown:

 * **Base Mainnet** - For production applications
 * **Base Sepolia** - For development and testing

 ![](https://mintcdn.com/coinbase-prod/h4Nc9NYI7BpHH7WQ/data/images/node-select-network.png?fit=max&auto=format&n=h4Nc9NYI7BpHH7WQ&q=85&s=4479b65d62737f753f50b99b60fff66e)
 ### Step: Copy your endpoint URL
Copy the displayed RPC endpoint URL. It will look like:```https://api.developer.coinbase.com/rpc/v1/base/YOUR_CLIENT_API_KEY```The Client API key is automatically included in the URL for authentication.
 
<Info>
 **About Client API Keys**

 Your RPC endpoint URL includes a Client API key, which is designed for client-side use and is safe to include in frontend code. For more details, see [CDP API Keys](/get-started/authentication/cdp-api-keys#client-api-keys).
</Info>

## 3. Make your first request

Now let's make your first blockchain request programmatically. We'll query the current block number on Base.

<Tabs>
 <Tab title="cURL">
#### Command```bash
curl https://api.developer.coinbase.com/rpc/v1/base/YOUR_CLIENT_API_KEY \
 -H "Content-Type: application/json" \
 -d '{
"jsonrpc": "2.0",
"id": 1,
"method": "eth_blockNumber"
 }'
```Response:
#### JSON```json
{
 "jsonrpc": "2.0",
 "id": 1,
 "result": "0x12a4b2c"
}
```</Tab>

 <Tab title="JavaScript (fetch)">```javascript
const rpcUrl = "https://api.developer.coinbase.com/rpc/v1/base/YOUR_CLIENT_API_KEY;

const response = await fetch(rpcUrl, {
 method: "POST",
 headers: {
"Content-Type": "application/json",
 },
 body: JSON.stringify({
jsonrpc: "2.0",
id: 1,
method: "eth_blockNumber",
 }),
});

const data = await response.json;
console.log("Current block:", parseInt(data.result, 16));
```</Tab>

 <Tab title="Python">```python
import requests
import json

rpc_url = "https://api.developer.coinbase.com/rpc/v1/base/YOUR_CLIENT_API_KEY

payload = {
"jsonrpc": "2.0",
"id": 1,
"method": "eth_blockNumber"
}

response = requests.post(rpc_url, json=payload)
result = response.json

# Convert hex to decimal
block_number = int(result["result"], 16)
print(f"Current block: {block_number}")
```</Tab>

 <Tab title="Node.js">```javascript
const https = require("https");

const rpcUrl = "https://api.developer.coinbase.com/rpc/v1/base/YOUR_CLIENT_API_KEY;

const payload = JSON.stringify({
 jsonrpc: "2.0",
 id: 1,
 method: "eth_blockNumber",
});

const options = {
 method: "POST",
 headers: {
"Content-Type": "application/json",
 },
};

const req = https.request(rpcUrl, options, (res) => {
 let data = "";
 res.on("data", (chunk) => (data += chunk));
 res.on("end", => {
const result = JSON.parse(data);
console.log("Current block:", parseInt(result.result, 16));
 });
});

req.write(payload);
req.end;
```</Tab>
</Tabs>


> Note:
**Using Ethereum libraries?** Node works with any Ethereum-compatible library like ethers.js, viem, web3.js, or web3.py. Just use your RPC endpoint URL as the provider.

## What to read next

* **[Core EVM Methods](/api-reference/json-rpc-api/core)**: Explore all available JSON-RPC methods
* **[Paymaster Methods](/api-reference/json-rpc-api/paymaster)**: Learn how to sponsor gas fees for your users
* **[Wallet History Methods](/api-reference/json-rpc-api/wallet-history)**: Query historical wallet data
* **[Rate Limits](/data/node/overview#rate-limits)**: Understand your usage limits and request increases
* **CDP Discord**: Join #node for support and to request rate limit increases



## Webhooks

# Welcome to Onchain Webhooks

Onchain webhooks enable developers to receive real-time notifications for any event from any contract on Base with guaranteed delivery.

<Info>
 Webhooks are currently in **Beta**. Join our Discord to provide feedback and stay updated on new features.
</Info>


 
- [Quickstart](/data/webhooks/quickstart)


 
- [Verify Signatures](/data/webhooks/verify-signatures)



## Key features

* **Guaranteed Delivery**: Receive events with an at-least-once delivery guarantee
* **Robust Retries**: Exponential backoff with up to 60 retries per event
* **Fresh Data**: \< 500ms end-to-end from tip of chain

## Use cases

* **Stablecoin Movement**: Subscribe to USDC transfers and get notified instantly when digital dollars change hands
* **NFT Ownership Tracking**: Track wallet transfers on any ERC721 contract
* **New Token Pair Creation**: Get notified when a new Uniswap pool is initialized
* **Yield Emission Changes**: Optimize yield in real-time by tracking changes in vault emissions
* **...and many more!** Flexible for many use cases.

## Supported networks

Currently available on **Base Mainnet**.

## What to read next

* **<a href="/api-reference/v2/rest-api/onchain-data/onchain-data" target="_blank">REST API Reference</a>**: View the complete webhook API documentation
* **Discord Community**: Join #onchain-data for support and feedback



# Webhooks Quickstart

## Overview

Get started with Onchain Webhooks in just a few steps. This guide will help you create a webhook subscription via our [REST endpoints](/api-reference/v2/rest-api/onchain-data/onchain-data) and receive the events at a target destination.

## Prerequisites

<Steps titleSize="p">
 
### Step: Create a Secret API Key
Sign up at [portal.cdp.coinbase.com](https://portal.cdp.coinbase.com then navigate to [API Keys](https://portal.cdp.coinbase.com/projects/api-keys) and select **Create API key** under the **Secret API Keys** tab.

 1. Enter an API key nickname (restrictions are optional)
 2. Click **Create**
 3. Secure your API Key ID and Secret in a safe location
 
### Step: Install cdpcurl
Install`cdpcurl`to make authenticated requests to CDP APIs:
#### Command```bash
# With Homebrew
brew tap coinbase/cdpcurl && brew install cdpcurl

# Or with Go
go install github.com/coinbase/cdpcurl@latest
```### Step: Get a webhook URL
You'll need an HTTPS URL to receive webhook events.

 
 **Easiest for testing:** You can use [webhook.site](https://webhook.site) to get a free temporary URL instantly where you can view payloads and test with up to 100 events before rate limits apply.
 
 
## 1. Construct subscription payload

Create a JSON payload to be used with`cdpcurl`in the next step:
#### JSON```json
{
 "description": "KyberSwap Bot USDC Transfers",
 "eventTypes": [
"onchain.activity.detected",
 ],
 "target": {
"url": "https://your-webhook-url.com
"method": "POST"
 },
 "labels": {
"contract_address": "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913", # USDC Contract Address
"event_name": "Transfer",
"transaction_from": "0xf20d2e37514195ebedb0bc735ba6090ce103d38c" # Optional: Filter to only receive transfers from this specific address (KyberSwap Bot Wallet)
 },
 "isEnabled": true
}
```### Configuration fields

| Field | Description | Required | Notes |
| --------------------------- | --------------------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
|`target.url`| Your webhook endpoint URL | Yes | Must be a valid HTTPS URL |
|`labels.contract_address`| Smart contract address to monitor | Yes | Hex address with`0x`prefix |
|`labels.event_name`| Smart contract event name | Yes\* (this OR`event_signature`) | Event name from ABI (e.g., `Transfer`) |
| `labels.event_signature`| Smart contract event signature | Yes\* (this OR`event_name`) | Full signature (e.g., `Transfer(address,address,uint256)`) |
| `eventTypes`| Array of event types | No | Use`["onchain.activity.detected"]`if provided |
|`isEnabled`| Enable/disable webhook | No | Defaults to`true`|
|`target.headers`| Custom HTTP headers | No | Object with header key-value pairs |
|`labels.params.[any_param]`| Any smart contract parameter | No | Add any parameter from the contract event for hyper-granular filtering (e.g.,`params.from`, `params.to`, `params.value`) |

### Custom headers

You can also set a `headers`object in`target`if your URL requires specific headers:
#### JSON```json
"target": {
"url": "https://your-webhook-url.com
"method": "POST",
"headers": {
 "custom-header": "value"
}
},
```## 2. Create subscription

Using the configuration you created in the previous step, create the webhook subscription using`cdpcurl`:
#### Command
```bash
cdpcurl -X POST \
 -i "YOUR_API_KEY_ID" \
 -s "YOUR_API_KEY_SECRET" \
 "https://api.cdp.coinbase.com/platform/v2/data/webhooks/subscriptions \
 -d '{
 "description": "KyberSwap Bot USDC Transfers",
 "eventTypes": [
"onchain.activity.detected",
 ],
 "target": {
"url": "https://your-webhook-url.com
"method": "POST"
 },
 "labels": {
"contract_address": "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913", # USDC Contract Address
"event_name": "Transfer",
"transaction_from": "0xf20d2e37514195ebedb0bc735ba6090ce103d38c" # Optional: Filter to only receive transfers that originate from a KyberSwap Bot Wallet
 },
 "isEnabled": true
}'
```You should see a response similar to the following:
#### JSON```json
201 Created
{
 "createdAt": "2025-10-08T13:58:38.681893Z",
 "description": "KyberSwap Bot USDC Transfers",
 "eventTypes": [
"onchain.activity.detected"
 ],
 "isEnabled": true,
 "labels": {
"project": "<YOUR_CDP_PROJECT_ID>",
"contract_address": "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
"event_name": "Transfer",
"transaction_from": "0xf20d2e37514195ebedb0bc735ba6090ce103d38c"
 },
 "metadata": {
"secret": "<SECRET_FOR_WEBHOOK_VERIFICATION>"
 },
 "subscriptionId": "<YOUR_SUBSCRIPTION_ID>",
 "target": {
"url": "https://your-webhook-url.com
 }
}
```## Additional endpoints

See the following examples to view, update, or delete the subscription using the`subscriptionId`from the response.

### List all subscriptions
#### Command```bash
cdpcurl -X GET \
 -i "YOUR_API_KEY_ID" \
 -s "YOUR_API_KEY_SECRET" \
 "https://api.cdp.coinbase.com/platform/v2/data/webhooks/subscriptions
```### View subscription details
#### Command```bash
cdpcurl -X GET \
 -i "YOUR_API_KEY_ID" \
 -s "YOUR_API_KEY_SECRET" \
 "https://api.cdp.coinbase.com/platform/v2/data/webhooks/subscriptions/<SUBSCRIPTION_ID>"
```### Update subscription
#### Command```bash
cdpcurl -X PUT \
 -i "YOUR_API_KEY_ID" \
 -s "YOUR_API_KEY_SECRET" \
 "https://api.cdp.coinbase.com/platform/v2/data/webhooks/subscriptions/<SUBSCRIPTION_ID>" \
 -d '{
"description": "Updated: KyberSwap Bot USDC Transfers",
"eventTypes": [
"onchain.activity.detected",
],
"target": {
 "url": "https://your-webhook-url.com
 "method": "POST"
},
"labels": {},
"isEnabled": true
 }'
```### Delete subscription
#### Command```bash
cdpcurl -X DELETE \
 -i "YOUR_API_KEY_ID" \
 -s "YOUR_API_KEY_SECRET" \
 "https://api.cdp.coinbase.com/platform/v2/data/webhooks/subscriptions/<SUBSCRIPTION_ID>"
```## What to read next

* **[Verify webhook signatures](/data/webhooks/verify-signatures)**: Learn how to verify webhook signatures to ensure events are coming from Coinbase
* **<a href="/api-reference/v2/rest-api/onchain-data/onchain-data" target="_blank">REST API Reference</a>**: View the complete webhook API documentation
* **[Support](/support/join-cdp-discord)**: Join our Discord for help and community support


# Verify Signatures

## Overview

Verifying webhook signatures ensures that incoming webhooks are authentic and sent by Coinbase, protecting your application from malicious requests and replay attacks.

## Why verify signatures?

Without signature verification, your webhook endpoint is vulnerable to:

* **Spoofed webhooks**: Attackers could send fake event data to your endpoint
* **Replay attacks**: Old webhook events could be resent to trigger duplicate processing
* **Man-in-the-middle attacks**: Modified webhook payloads could go undetected


> Warning:
Always verify webhook signatures in production. Unverified webhooks can lead to security vulnerabilities and data integrity issues.

## How it works

When you create a webhook subscription, the response includes a`metadata.secret`that serves as your signing key.

Each webhook request includes an`X-Hook0-Signature`header that looks like this:```text
t=1728394718,h=content-type x-hook0-id,v1=a1b2c3d4e5f6...
```The signature header contains three parts:

| Field | Description | Example |
| ----- | ---------------------------------------------------------- | ------------------------- |
|`t`| Unix timestamp when the webhook was sent |`1728394718`|
|`h`| Space-separated list of header names included in signature |`content-type x-hook0-id`|
|`v1`| HMAC-SHA256 signature of the payload |`a1b2c3d4e5f6...`|


 1. **Extract signature components**: Parse the`t`, `h`, and `v1`values from the header
 2. **Build signed payload**: Concatenate`timestamp.headerNames.headerValues.rawBody`3. **Compute expected signature**: Create HMAC-SHA256 hash using your secret
 4. **Compare signatures**: Use timing-safe comparison to match expected vs. provided
 5. **Verify timestamp**: Ensure the webhook isn't too old (prevents replay attacks)


### 1. Create a verification function

First, handle the verification logic in a reusable function which will:

* Parse the signature header to extract the timestamp, header names, and signature
* Build the signed payload by concatenating the timestamp, headers, and raw body
* Compute the expected signature using HMAC-SHA256
* Compare the signatures using a timing-safe comparison to prevent timing attacks
* Validate the timestamp to ensure the webhook isn't too old (replay attack prevention)```javascript
const crypto = require('crypto');

/**
 * Verify webhook signature and timestamp
 * @param {string} payload - Raw request body as string
 * @param {string} signatureHeader - X-Hook0-Signature header value 
 * @param {string} secret - Secret from metadata.secret in subscription creation
 * @param {Object} headers - HTTP headers from webhook request
 * @param {number} maxAgeMinutes - Max age for webhook (default: 5 minutes)
 * @returns {boolean} true if webhook is authentic and within allowed time window
 */
function verifyWebhookSignature(payload, signatureHeader, secret, headers, maxAgeMinutes = 5) {
try {
// Parse signature header: t=timestamp,h=headers,v1=signature
const elements = signatureHeader.split(',');
const timestamp = elements.find(e => e.startsWith('t=')).split('=')[1];
const headerNames = elements.find(e => e.startsWith('h=')).split('=')[1];
const providedSignature = elements.find(e => e.startsWith('v1=')).split('=')[1];

// Build header values string
const headerNameList = headerNames.split(' ');
const headerValues = headerNameList.map(name => headers[name] || '').join('.');

// Build signed payload
const signedPayload = `${timestamp}.${headerNames}.${headerValues}.${payload}`;

// Compute expected signature
const expectedSignature = crypto
.createHmac('sha256', secret)
.update(signedPayload, 'utf8')
.digest('hex');

// Compare signatures securely
const signaturesMatch = crypto.timingSafeEqual(
Buffer.from(expectedSignature, 'hex'),
Buffer.from(providedSignature, 'hex')
);

// Verify timestamp to prevent replay attacks
const webhookTime = parseInt(timestamp) * 1000; // Convert to milliseconds
const currentTime = Date.now;
const ageMinutes = (currentTime - webhookTime) / (1000 * 60);

if (ageMinutes > maxAgeMinutes) {
console.error(`Webhook timestamp exceeds maximum age: ${ageMinutes.toFixed(1)} minutes > ${maxAgeMinutes} minutes`);
return false;
}

return signaturesMatch;

} catch (error) {
console.error('Webhook verification error:', error);
return false;
}
}
```### 2. Verify webhooks in your application

Now integrate the verification function into your webhook endpoint. This example shows:

* How to configure Express to preserve the raw request body (required for signature verification)
* How to extract the signature header and webhook secret
* How to call the verification function before processing the webhook
* How to handle both valid and invalid webhooks appropriately

<Info>
 **Important**: You must use`express.raw`middleware instead of`express.json`to preserve the raw request body. The signature is computed against the raw bytes, so parsing the JSON first will break verification.
</Info>```javascript
const express = require("express");
const app = express;

// Important: Get raw body for signature verification
app.use(express.raw({ type: "application/json" }));

app.post("/webhook", (req, res) => {
// Step 1: Extract the raw payload (must be string for signature verification)
const payload = req.body.toString;

// Step 2: Get the signature from the X-Hook0-Signature header
const signature = req.headers["x-hook0-signature"];

// Step 3: Get your webhook secret (from metadata.secret in subscription creation)
const secret = process.env.WEBHOOK_SECRET;

// Step 4: Verify the webhook signature
if (verifyWebhookSignature(payload, signature, secret, req.headers)) {
console.log("✅ Authentic webhook");

// Step 5: Parse the JSON payload (only after verification!)
const event = JSON.parse(payload);

// Step 6: Process your webhook event
console.log("Transaction detected:", event.data.transactionHash);
// Add your business logic here...

// Step 7: Return 200 to acknowledge receipt
res.status(200).send("OK");
} else {
console.log("❌ Invalid webhook - rejected");
res.status(400).send("Invalid signature");
}
});
```### Example webhook payload

Here's what a complete webhook request looks like:
#### JSON```json
{
 "id": "evt_1a2b3c4d5e6f",
 "type": "onchain.activity.detected",
 "createdAt": "2025-10-08T13:58:38.681893Z",
 "data": {
"subscriptionId": "sub_abc123",
"networkId": "base-mainnet",
"blockNumber": 12345678,
"blockHash": "0xabc123...",
"transactionHash": "0xdef456...",
"logIndex": 42,
"contractAddress": "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
"eventName": "Transfer",
"from": "0xf20d2e37514195ebedb0bc735ba6090ce103d38c",
"to": "0x1234567890123456789012345678901234567890",
"value": "1000000"
 }
}
```The webhook request will include these HTTP headers:```text
POST /webhook HTTP/1.1
Host: your-webhook-url.com
Content-Type: application/json
X-Hook0-Signature: t=1728394718,h=content-type x-hook0-id,v1=a1b2c3d4e5f6...
X-Hook0-Id: evt_1a2b3c4d5e6f
Content-Length: 512
```## Security best practices


 
 Never hardcode webhook secrets in your code. Use environment variables or a secure secrets manager:```javascript
// ✅ Good - using environment variables
const secret = process.env.WEBHOOK_SECRET;

// ❌ Bad - hardcoded secret
const secret = "whsec_abc123...";
```Always use HTTPS endpoints for your webhooks. HTTP endpoints expose your webhook data to interception and tampering.
 

 
 Add rate limiting to your webhook endpoint to prevent abuse:```javascript
const rateLimit = require('express-rate-limit');

const webhookLimiter = rateLimit({
 windowMs: 1 * 60 * 1000, // 1 minute
 max: 100 // limit each IP to 100 requests per minute
});

app.post('/webhook', webhookLimiter, (req, res) => {
 // Your webhook handler
});
```The default 5-minute window prevents replay attacks. Adjust based on your needs, but don't make it too large:```javascript
// Default 5 minutes is recommended
verifyWebhookSignature(payload, signature, secret, headers, 5);

// For high-security applications, use a shorter window
verifyWebhookSignature(payload, signature, secret, headers, 1);
```Track failed verification attempts to detect potential security issues:```javascript
if (!verifyWebhookSignature(payload, signature, secret, headers)) {
 console.error('Webhook verification failed', {
timestamp: new Date.toISOString,
ip: req.ip,
signature: signature,
// Don't log the payload as it may contain sensitive data
 });
 res.status(400).send("Invalid signature");
 return;
}
```</AccordionGroup>

## Error handling

Handle common verification failures gracefully:```javascript
app.post('/webhook', (req, res) => {
 const payload = req.body.toString;
 const signature = req.headers['x-hook0-signature'];
 const secret = process.env.WEBHOOK_SECRET;
 
 // Check for missing signature
 if (!signature) {
console.error('Missing X-Hook0-Signature header');
return res.status(400).send('Missing signature');
 }
 
 // Check for missing secret
 if (!secret) {
console.error('Webhook secret not configured');
return res.status(500).send('Server configuration error');
 }
 
 try {
const isValid = verifyWebhookSignature(payload, signature, secret, req.headers);

if (!isValid) {
 console.error('Invalid webhook signature');
 return res.status(400).send('Invalid signature');
}

// Process the webhook
const event = JSON.parse(payload);

// Handle specific event types
if (event.type === 'onchain.activity.detected') {
 // Process transaction event
 console.log('Transaction detected:', event.data.transactionHash);
}

res.status(200).send('OK');

 } catch (error) {
console.error('Webhook processing error:', error);
res.status(500).send('Processing error');
 }
});
```
## What to read next

* **[Quickstart](/data/webhooks/quickstart)**: Set up your first webhook subscription
* **<a href="/api-reference/v2/rest-api/onchain-data/onchain-data" target="_blank">REST API Reference</a>**: View the complete webhook API documentation




## SQL API

# Welcome to SQL API

The SQL API is a zero-infrastructure indexing solution that allows any developer to pull real-time and historical onchain data on Base using custom SQL queries. Unlike Address History API which provides fixed endpoints for wallet data, SQL API gives you complete flexibility to query any blockchain data.


- [Try it now: Quickstart](/data/sql-api/quickstart)


Developers can access the SQL API through:


 
- [SQL Playground](https://portal.cdp.coinbase.com/products/data/playground)


 
- [REST API](/data/sql-api/rest-apis)



## Key Features

* **Zero Infra:** No setup, no guesswork. Just real-time indexed onchain data.
* **Customizable:** Leverage familiar SQL syntax to pull custom data.
* **Responsive:** Pull custom onchain data with \< 500ms latency.
* **Fresh:** \< 250ms end-to-end from tip of chain.

## Use Cases

* **Payment Service Providers:** Track real-time stablecoin transactions for merchants, consumers, and marketplaces.
* **Portfolio & Treasury:** Give users and institutions a live view of wallet balances and historical flows. Build dashboards that update instantly as funds move across chains, protocols, and counterparties.
* **Onchain Games:** Track player inventory, asset upgrades, and progression in real time as NFT metadata evolves. Enable game mechanics that reflect actual onchain state — not stale snapshots.
* **Onchain Social:** Monitor user interactions like tips, follows, and reactions across decentralized social graphs. Surface meaningful engagement and value transfer between users, apps, and agents.

## Schema

The SQL API runs queries against an opinionated schema for efficient organization and response delivery. You can read more in the [schema reference](/data/sql-api/schema). For the CoinbaSeQL grammar, you can find that in the [CoinbaSeQL reference](/data/sql-api/sql).

## Support and feedback

Join **#onchain-data** in the CDP Discord to access FAQs, schedule project discussions, and connect with other developers. We welcome your feedback and suggestions for improvement.



# SQL API: Quickstart

export const SqlApiRestExample = => {
 return <>
 <p>The SQL API <code>/run</code> endpoint accepts your query as a string value. Before running, replace <code>$CLIENT_TOKEN</code> with your <a href="https://portal.cdp.coinbase.com/projects/api-keys/client-key>CDP Client API key</a>.</p>

 <CodeBlock language="shell">
{`curl -H "Authorization: Bearer $CLIENT_TOKEN" -H "Content-Type: application/json" -X POST "https://api.cdp.coinbase.com/platform/v2/data/query/run -d '{"sql": "SELECT * FROM base.events LIMIT 1"}'`}
 </CodeBlock>

 <p>After running the above, you should see a similar response to the following:</p>

 <CodeBlock language="json">
{`{
 "metadata": {
 "cached": false,
 "executionTimeMs": 17,
 "rowCount": 1
 },
 "result": [
 {
 "action": "added",
 "address": "0x09c7bad99688a55a2e83644bfaed09e62bdcccba",
 "block_hash": "0xed367272b150a98953cb5a1fe725742373432f89c848852e6ebe8319c4bf901f",
 "block_number": "6728",
 "block_timestamp": "2023-06-15T04:20:03.000Z",
 "event_name": "AdminChanged",
 "event_signature": "AdminChanged(address,address)",
 "log_id": "9f33b5afc2f2ade4bcdcefd3077945dc",
 "log_index": 0,
 "parameter_types": {
 "newAdmin": "address",
 "previousAdmin": "address"
 },
 "parameters": {
 "newAdmin": "0x76a737dac0c4eb926bd7d2d68b958a1ae6ad6993",
 "previousAdmin": "0x0000000000000000000000000000000000000000"
 },
 "topics": [
 "0x7e644d79422f17c01e4894b5f4f588d331ebfa28653d42ae832dc59e38c9798f"
 ],
 "transaction_from": "0x0cf966857325db9a9b4dada66e80ce581c18aca1",
 "transaction_hash": "0x08ecc43f4394eb6a7c0c7bf89d4c95c2ba67a7d3ce9f08dc09c5f8c29b1e5de3",
 "transaction_to": "0x4e59b44847b379578588920ca78fbf26c0b4956c"
 }
 ]
}`}
 </CodeBlock>
 </>;
};

export const SqlPlaygroundQuickstart = => {
 return <>
 <p>Use our SQL API to query onchain data in milliseconds. With SQL API, you can:</p>
 <ul>
 <li>Query <strong>transactions, events, blocks, and transfers</strong> across Base with <strong>&lt; 500ms latency</strong></li>
 <li>Join data across tables for complex analytics</li>
 <li>Track token flows, smart contract activity, and wallet behavior</li>
 </ul>
 <p>The fastest way to query onchain data is through the <strong>SQL Playground</strong> in CDP Portal.</p>
 
### Step: Open SQL Playground
Navigate to the <a href="https://portal.cdp.coinbase.com/products/data/playground>SQL Playground</a> in Portal.
 
### Step: Try a query
Copy this query to see recent USDC transfers on Base:

 <CodeBlock language="sql">
{`SELECT 
 parameters['from'] AS sender,
 parameters['to'] AS to,
 parameters['value'] AS amount,
 address AS token_address
FROM base.events
WHERE 
 event_signature = 'Transfer(address,address,uint256)'
 AND address = '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913'
LIMIT 10;`}
 </CodeBlock>

 See results in milliseconds! ⚡
 
 ![](/data/images/sql-playground-quickstart-query.png)
 </>;
};

## Overview

The SQL API allows you to create custom queries to pull real-time and historical onchain data from Base.

In this quickstart, you will learn how to:

* Read and use the tables in CDP's curated schema.
* Pull data from the Base blockchain with a SQL query.
 ​

## Prerequisites

Sign in to the [CDP Portal](https://portal.cdp.coinbase.com/)

<Note>
 **Using the SQL Playground?** No API keys needed!

 **Using the API programmatically?** Create a free [CDP Client API key](https://portal.cdp.coinbase.com/projects/api-keys/client-key) for the cURL example below.
</Note>

## 1. Try it in the playground

<SqlPlaygroundQuickstart />

## 2. Run a query programmatically

<SqlApiRestExample />

## What to read next

* [Schema reference](/data/sql-api/schema): Familiarize yourself with our supported tables for SQL queries
* [REST API Reference](/data/sql-api/rest-apis): Use the SQL API programmatically



# Schema

The SQL API schema is a set of opinionated tables and columns used to organize onchain data for efficient retrieval.

## Supported Tables

| Table | Description |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| [base.blocks](#base-blocks) | Block metadata including timestamps and difficulty |
| [base.events](#base-events) | Decoded event logs with contract interactions on Base |
| [base.transactions](#base-transactions) | Transaction data including hash, block number, gas usage |
| [base.encoded\_logs](#base-encoded-logs) | Encoded log data of event logs that aren't able to be decoded by our event decoder (ex: log0 opcode) |
| [base.transfers](#base-transfers) | Token transfer events including block details, addresses, and amounts |

## base.blocks

Block metadata including timestamps and difficulty.


> Note:
See an example block on [Basescan](https://basescan.org/block/1000000) to understand how blockchain data corresponds to these SQL fields.

| Field | Type | Description |
| --------------------------- | -------- | ---------------------------------------------------------------------------- |
| block\_number | uint64 | The number of the block |
| block\_hash | String | The unique hash identifying this block |
| parent\_hash | String | The hash of the parent block |
| timestamp | DateTime | The timestamp when this block was created |
| miner | String | The address of the miner/validator who created this block |
| nonce | uint64 | The proof-of-work nonce value |
| sha3\_uncles | String | The hash of the uncles list for this block |
| transactions\_root | String | The root hash of the transactions trie |
| state\_root | String | The root hash of the state trie |
| receipts\_root | String | The root hash of the receipts trie |
| logs\_bloom | String | The bloom filter for the logs of the block |
| gas\_limit | uint64 | The maximum gas allowed in this block |
| gas\_used | uint64 | The total gas used by all transactions in this block |
| base\_fee\_per\_gas | uint64 | The base fee per gas in this block (EIP-1559) |
| total\_difficulty | String | The total difficulty of the chain up to this block |
| size | uint64 | The size of this block in bytes |
| extra\_data | String | Extra data field for this block |
| mix\_hash | String | The mix hash for this block |
| withdrawals\_root | String | The root hash of withdrawals (post-merge) |
| parent\_beacon\_block\_root | String | The parent beacon block root (post-merge) |
| blob\_gas\_used | uint64 | The amount of blob gas used in this block |
| excess\_blob\_gas | uint64 | The excess blob gas in this block |
| transaction\_count | uint64 | The number of transactions in this block |
| action | Int8 | Indicates if block was added (1) or removed (-1) due to chain reorganization |

## base.events

Decoded event logs with contract interactions on Base.


> Note:
See example events on [Basescan](https://basescan.org/tx/0x08ecc43f4394eb6a7c0c7bf89d4c95c2ba67a7d3ce9f08dc09c5f8c29b1e5de3#eventlog) to see how event logs appear on the blockchain.

| Field | Type | Description |
| ------------------ | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| block\_number | uint64 | The block number |
| block\_hash | String | A keccak-256 (SHA-3) hash of the block's header data. Unique to the block's contents. Used to verify the integrity of the block |
| timestamp | DateTime64 | Time at which the block was created |
| transaction\_hash | String | A keccak-256 hash of the signed transaction data. Unique identifier, on the blockchain, for this specific transaction |
| transaction\_to | String | The address the transaction is acting against. Could be either an EOA (ex: ETH transfer) or a contract (ex: smart contract call) |
| transaction\_from | String | The address that originated the transaction. Will be an EOA |
| transaction\_index | uint64 | The order in which the transaction was included in the block. Commonly used to match transactions to their logs |
| log\_index | uint64 | The index of the log within the transaction. First log is in the transaction at index 0, second is index 1, etc |
| address | String | The address of the contract that the log was created from |
| topics | Array(String) | The topics of the log. Topics are the indexed parameters of the event and the keccak256 hash of the event signature |
| event\_name | String | Human-readable name of the event |
| event\_signature | String | Full canonical declaration of the event, including its name and parameter types. Used to generate the hash |
| parameters | Map(String, Variant(Bool, Int256, String, uint256)) | Map of parameter name to its value |
| parameter\_types | Map(String, String) | Map of parameter name to its ABI type |
| action | Int8 | If the log is created, it is 1. If the log is re-orged out it is -1. If the sum of all actions for a given log is greater than 0, the log is "active", meaning it is still in the chain (has not been re-orged out) |

## base.transactions

Transaction data including hash, block number, gas usage.


> Note:
See an example transaction on [Basescan](https://basescan.org/tx/0x08ecc43f4394eb6a7c0c7bf89d4c95c2ba67a7d3ce9f08dc09c5f8c29b1e5de3) to understand how transaction data corresponds to these SQL fields.

| Field | Type | Description |
| ---------------------------- | ------------- | ---------------------------------------------------------------------------------- |
| block\_number | uint64 | The number of the block that contains this transaction |
| block\_hash | String | The hash of the block that contains this transaction |
| transaction\_hash | String | The unique hash identifying this transaction |
| transaction\_index | uint64 | The index position of this transaction within its block |
| from\_address | String | The address that originated this transaction |
| to\_address | String | The destination address for this transaction |
| value | String | The value being transferred in this transaction |
| gas | uint64 | The amount of gas allocated for this transaction |
| gas\_price | uint64 | The price of gas (in wei) for this transaction |
| input | String | The data payload sent with this transaction |
| nonce | uint64 | The number of transactions sent from this address before this one |
| type | uint64 | The transaction type |
| max\_fee\_per\_gas | uint64 | The maximum fee per gas the sender is willing to pay |
| max\_priority\_fee\_per\_gas | uint64 | The maximum priority fee per gas the sender is willing to pay |
| chain\_id | uint64 | The chain ID this transaction is valid for |
| v | String | The v component of the transaction signature |
| r | String | The r component of the transaction signature |
| s | String | The s component of the transaction signature |
| is\_system\_tx | Bool | Whether this is a system transaction |
| max\_fee\_per\_blob\_gas | String | The maximum fee per blob gas the sender is willing to pay |
| blob\_versioned\_hashes | Array(String) | Array of versioned hashes for any blobs associated with this transaction |
| timestamp | DateTime64 | The timestamp when this transaction was included in a block |
| action | Int8 | Indicates if transaction was added (1) or removed (-1) due to chain reorganization |

## base.encoded\_logs

Encoded log data of event logs that aren’t able to be decoded by our event decoder (ex: log0 opcode).

| Field | Type | Description |
| ----------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| block\_number | uint64 | The number of the block that the log is in |
| block\_hash | String | The hash of the block that the log is in |
| block\_timestamp | DateTime64 | The timestamp of the block that the log is in |
| transaction\_hash | String | The hash of the transaction that the log is in |
| transaction\_to | String | The address the transaction is acting against. Could be either an EOA (ex: ETH transfer) or a contract (ex: smart contract call) |
| transaction\_from | String | The address that originated the transaction. Will be an EOA |
| log\_index | uint32 | The index of the log within the transaction. First log is in the transaction at index 0, second is index 1, etc |
| address | String | The address of the contract that the log was created from |
| topics | Array(String) | The topics of the log. Topics are the indexed parameters of the event and the keccak256 hash of the event signature |
| action | Enum8('removed' = -1, 'added' = 1) | If the log is created, it is 1. If the log is re-orged out it is -1. If the sum of all actions for a given log is greater than 0, the log is "active", meaning it is still in the chain (has not been re-orged out) |

## base.transfers

Token transfer events including block details, addresses, and amounts


> Note:
See example token transfers on [Basescan](https://basescan.org/token/0x833589fcd6edb6e08f4c7c32d4f71b54bda02913) (USDC on Base) to understand how transfer events appear on the blockchain.

| Field | Type | Description |
| ----------------- | ---------- | ---------------------------------------- |
| block\_number | uint64 | Block number containing the transfer |
| block\_timestamp | DateTime64 | Block timestamp |
| transaction\_to | String | Transaction recipient address |
| transaction\_from | String | Transaction sender address |
| log\_index | uint32 | Log index within the transaction |
| token\_address | String | Address of the token contract |
| from\_address | String | Address tokens are transferred from |
| to\_address | String | Address tokens are transferred to |
| value | uint256 | Amount of tokens transferred |
| action | Enum8 | Action: 1 for add, -1 for re-org removal |



# CoinbaSeQL Grammar

## Overview

This page provides the ANTLR4 grammar specification for CoinbaSeQL (pronounced "coinbase QL"), the SQL dialect used by the SQL API.

<Note>
 **This page is designed for AI/LLM consumption.** If you're using AI tools like ChatGPT, Claude, or Cursor to help write SQL queries, provide this grammar along with the [schema reference](/data/sql-api/schema) to generate syntactically correct queries.
</Note>

CoinbaSeQL supports all standard SQL query features. For practical examples and usage, see:

* **[Quickstart](/data/sql-api/quickstart)** - Try queries in the SQL Playground
* **[Schema Reference](/data/sql-api/schema)** - Explore available tables and columns
* **[FAQ](/data/sql-api/faq)** - Common questions about supported features

## For AI tools and query validators

The complete ANTLR4 grammar specification below defines exactly what SQL syntax is supported by CoinbaSeQL.

### Design Principles

CoinbaSeQL is created with the following principles:

* As similar to standard SQL as possible
* Support all common SQL features per the SQL standard
* Provide understandable, actionable, and helpful error messages

### Grammar Specification

You can also retrieve this grammar programmatically via the [Get SQL Grammar endpoint](/api-reference/v2/rest-api/sql-api/get-sql-grammar).
```antlr
grammar SqlQuery;

// If you update this grammar, simply run `make gen` from the top-level to update the parsing logic.
// Inspired by ClickHouse parser and lexer:
// https://github.com/abyss7/ClickHouse/blob/master/src/Parsers/New/ClickHouseParser.g4
// https://github.com/abyss7/ClickHouse/blob/master/src/Parsers/New/ClickHouseLexer.g4

// Parser rules
query: cteClause? unionStatement SEMICOLON? EOF;

unionStatement:
	unionSelect (unionOperator unionSelect)* (
 ORDER BY orderByElements
	)? (LIMIT limitClause)?;

unionSelect: selectStatement | LPAREN selectStatement RPAREN;

unionOperator: UNION ALL | UNION DISTINCT | UNION;

cteClause: WITH cteDefinition (COMMA cteDefinition)*;

cteDefinition:
	cteName (LPAREN columnList RPAREN)? AS LPAREN selectStatement RPAREN;

cteName: identifier;

columnList: identifier (COMMA identifier)*;

selectStatement:
	SELECT (DISTINCT)? selectElements FROM tableExpression (
 WHERE condition
	)? (GROUP BY groupByElements)? (ORDER BY orderByElements)? (
 LIMIT limitClause
	)?
	| SELECT (DISTINCT)? selectElements // For literals/expressions without FROM
	(ORDER BY orderByElements)? (LIMIT limitClause)?;

selectElements: STAR | selectElement (COMMA selectElement)*;

selectElement: expression (AS? alias)? | tableWildcard;

tableWildcard: (identifier DOT)? STAR;

tableExpression: tableReference (joinExpression)*;

tableReference:
	tableOrCteReference (AS? alias)?
	| LPAREN selectStatement RPAREN (AS? alias)?
	| LPAREN unionStatement RPAREN (AS? alias)?;

tableOrCteReference: tableName | identifier;

joinExpression: joinType? JOIN tableReference ON condition;

joinType: INNER | LEFT | RIGHT | FULL;

condition: expression;

groupByElements: expression (COMMA expression)*;

orderByElements: orderByElement (COMMA orderByElement)*;

orderByElement: expression (ASC | DESC)?;

limitClause: INTEGER_LITERAL;

expression:
	expression BETWEEN expression AND expression
	| expression IN LPAREN (expressionList | selectStatement) RPAREN
	| expression IS (NOT)? NULL
	| expression binaryOperator expression
	| expression CAST_OP dataType // PostgreSQL-style casting (e.g., 1::Int32)
	| expression DOT identifier // Dot notation
	| expression LBRACKET expression RBRACKET // Array/map indexing
	| functionCall
	| castExpression // Standard SQL CAST function
	| LPAREN expression RPAREN
	| CASE (expression)? whenClause+ (ELSE expression)? END
	| primaryExpression;

castExpression: CAST LPAREN expression AS dataType RPAREN;

dataType:
	identifier (LPAREN typeArguments RPAREN)?
	| ARRAY LPAREN dataType RPAREN // Array(Int32)
	| MAP LPAREN dataType COMMA dataType RPAREN // Map(String, String)
	| TUPLE LPAREN dataType (COMMA dataType)* RPAREN; // Tuple(Int32, String)

typeArguments: typeArgument (COMMA typeArgument)*;

typeArgument: dataType | INTEGER_LITERAL;

whenClause: WHEN expression THEN expression;

expressionList: expression (COMMA expression)*;

primaryExpression:
	columnReference
	| literal
	| arrayLiteral // Array literal [1, 2, 3]
	| mapLiteral // Map literal {'key': 'value'}
	| tupleLiteral // Tuple literal (1, 'a', true)
	| LPAREN selectStatement RPAREN; // Subquery as primary expression

columnReference: (tableOrCtePrefix DOT)? columnName;

tableOrCtePrefix: tableName | identifier;

functionCall: identifier LPAREN functionArgs? RPAREN;

lambda: lambdaParams ARROW expression;

lambdaParams:
	identifier
	| LPAREN (identifier (COMMA identifier)*)? RPAREN;

functionArgs:
	STAR
	| DISTINCT expressionList
	| lambda (COMMA expressionList)?
	| expressionList;

binaryOperator:
	EQ
	| NEQ
	| LT
	| LE
	| GT
	| GE
	| PLUS
	| MINUS
	| STAR
	| DIV
	| MOD
	| AND
	| OR
	| LIKE;

literal:
	STRING_LITERAL
	| INTEGER_LITERAL
	| DECIMAL_LITERAL
	| NULL
	| TRUE
	| FALSE;

arrayLiteral:
	LBRACKET (expression (COMMA expression)*)? RBRACKET;

mapLiteral:
	LBRACE (mapEntry (COMMA mapEntry)*)? RBRACE
	| MAP LPAREN (mapPair (COMMA mapPair)*)? RPAREN;

mapEntry: expression COLON expression;

mapPair: expression COMMA expression;

tupleLiteral:
	LPAREN expression (COMMA expression)+ RPAREN // Requires at least 2 elements
	| TUPLE LPAREN (expression (COMMA expression)*)? RPAREN;

tableName: identifier (DOT identifier)?;

columnName: identifier;

functionName: identifier;

alias: identifier;

identifier: IDENTIFIER | QUOTED_IDENTIFIER | keyword;

// All keywords that can potentially be used as identifiers
keyword:
	SELECT
	| FROM
	| WHERE
	| GROUP
	| BY
	| ORDER
	| LIMIT
	| AS
	| JOIN
	| ON
	| INNER
	| LEFT
	| RIGHT
	| FULL
	| AND
	| OR
	| NOT
	| IN
	| BETWEEN
	| LIKE
	| IS
	| NULL
	| TRUE
	| FALSE
	| CASE
	| WHEN
	| THEN
	| ELSE
	| END
	| DISTINCT
	| ASC
	| DESC
	| CAST
	| WITH
	| UNION
	| ALL
	| ARRAY
	| MAP
	| TUPLE
	| OFFSET
	| OUTER;

// Lexer rules - Keywords
SELECT: S E L E C T;
FROM: F R O M;
WHERE: W H E R E;
GROUP: G R O U P;
BY: B Y;
ORDER: O R D E R;
LIMIT: L I M I T;
AS: A S;
JOIN: J O I N;
ON: O N;
INNER: I N N E R;
LEFT: L E F T;
RIGHT: R I G H T;
FULL: F U L L;
AND: A N D;
OR: O R;
NOT: N O T;
IN: I N;
BETWEEN: B E T W E E N;
LIKE: L I K E;
IS: I S;
NULL: N U L L;
TRUE: T R U E;
FALSE: F A L S E;
CASE: C A S E;
WHEN: W H E N;
THEN: T H E N;
ELSE: E L S E;
END: E N D;
DISTINCT: D I S T I N C T;
ASC: A S C;
DESC: D E S C;
CAST: C A S T;
WITH: W I T H;
UNION: U N I O N;
ALL: A L L;
ARRAY: A R R A Y;
MAP: M A P;
TUPLE: T U P L E;
OFFSET: O F F S E T;
OUTER: O U T E R;

// Lexer rules - Comparison Operators
EQ: '=';
NEQ: '!=' | '<>';
LT: '<';
GT: '>';
LE: '<=';
GE: '>=';

// Lexer rules - Arithmetic Operators
PLUS: '+';
MINUS: '-';
STAR: '*';
DIV: '/';
MOD: '%';
ARROW: '->';

// Lexer rules - Delimiters
LPAREN: '(';
RPAREN: ')';
COMMA: ',';
SEMICOLON: ';';
DOT: '.';
LBRACKET: '[';
RBRACKET: ']';
LBRACE: '{';
RBRACE: '}';
COLON: ':';
CAST_OP: '::';

// Lexer rules - Literals
STRING_LITERAL: '\'' (~['])* '\'';

INTEGER_LITERAL: [0-9]+;

DECIMAL_LITERAL: [0-9]+ '.' [0-9]* | '.' [0-9]+;

IDENTIFIER: [a-zA-Z_] [a-zA-Z_0-9]*;

QUOTED_IDENTIFIER:
	'"' (~'"' | '""')* '"'
	| '`' (~'`' | '``')* '`';

// Whitespace and comments
WS: [ \t\r\n]+ -> skip;
COMMENT: '--' ~[\r\n]* -> skip;
MULTI_LINE_COMMENT: '/*' .*? '*/' -> skip;

// Case-insensitive matching fragments
fragment A: [aA];
fragment B: [bB];
fragment C: [cC];
fragment D: [dD];
fragment E: [eE];
fragment F: [fF];
fragment G: [gG];
fragment H: [hH];
fragment I: [iI];
fragment J: [jJ];
fragment K: [kK];
fragment L: [lL];
fragment M: [mM];
fragment N: [nN];
fragment O: [oO];
fragment P: [pP];
fragment Q: [qQ];
fragment R: [rR];
fragment S: [sS];
fragment T: [tT];
fragment U: [uU];
fragment V: [vV];
fragment W: [wW];
fragment X: [xX];
fragment Y: [yY];
fragment Z: [zZ];
```## How to use this with AI tools

When using AI assistants to write SQL queries:

1. **Provide context**: Give your AI tool both this grammar specification and the [schema reference](/data/sql-api/schema)
2. **Be specific**: Ask for queries that match your specific use case (e.g., "Write a query to find all USDC transfers over \$1000 in the last 24 hours")
3. **Validate**: Always test AI-generated queries in the [SQL Playground](https://portal.cdp.coinbase.com/products/data/playground) before using them in production


> Note:
Providing this grammar helps LLMs generate queries that pass CoinbaSeQL validation on the first try.

# SQL API FAQ

### What SQL features are supported?

CoinbaSeQL supports all standard SQL query features including SELECT statements, WHERE filtering, JOINs, aggregations (COUNT, SUM, AVG, MIN, MAX), subqueries, Common Table Expressions (CTEs), UNION operations, and CASE statements. See the [CoinbaSeQL reference](/data/sql-api/sql) for details.

### What's the difference between SQL API and Wallet History API?

* **SQL API**: Write custom SQL queries against any blockchain data (events, transactions, blocks, transfers). Flexible and powerful.
* **Wallet History API**: Pre-built endpoints for wallet-specific data. Simple and fast for common wallet operations.

Use SQL API when you need custom queries or data beyond wallet history. Use Wallet History API for simple wallet transaction and balance lookups.

### Do I need API keys?

* **SQL Playground** (browser): No API keys needed—just sign in to [CDP Portal](https://portal.cdp.coinbase.com/)
* **REST API** (programmatic): Yes, create free [Client API keys](https://portal.cdp.coinbase.com/projects/api-keys/client-key)

### What are the query limits?

* **Maximum result set**: 10,000 rows
* **Query timeout**: 30 seconds
* **Maximum JOINs**: 5 per query
* **Query length**: 50,000 characters maximum
* **Rate limit**: 100 requests per second

### How do I optimize slow queries?

1. **Use indexed columns in WHERE clauses**: For example, when querying`base.events`, query by `event_signature`and`address`. Check the schema of each table
2. **Use specific block ranges**: Query smaller block ranges by `block_timestamp`rather than the entire blockchain's history from genesis
3. **Filter early**: Put selective filters in WHERE clauses
4. **Avoid SELECT \***: Select only the columns you need

### What happens if my query times out?

If your query exceeds the 30-second timeout, you'll receive a`timed_out`error. To fix:

* Filter by`event_signature`to remove any irrelevant event logs
* Reduce the block range in your WHERE clause via the`block_timestamp`field
* Simplify complex JOINs (avoid`OR`in JOINs)

### What networks are supported?

SQL API supports **Base Mainnet** and **Base Sepolia**. Each table is prefixed with the network (e.g.,`base.events`, `base.transactions`for mainnet,`base_sepolia.events`for testnet).

### How fresh is the data?

SQL API data is **\< 250ms from chain tip** with query response latency **\< 500ms**. This means you get near real-time blockchain data.

### What data types does SQL API support?

SQL API uses ClickHouse data types including:

* **Numeric**: UInt8, UInt16, UInt32, UInt64, UInt128, UInt256, Int8, Int16, Int32, Int64, Int128, Int256
* **String**: String
* **Boolean**: Bool
* **Temporal**: Date, DateTime, DateTime64
* **Complex**: Array, Map, Tuple

See the [schema reference](/data/sql-api/schema) for field-level type information.

### How do I handle re-orgs?

Each table includes an`action`field:

*`1`or`'added'`: Data was added to the chain
* `-1`or`'removed'`: Data was removed due to reorganization

To query only active (non-reorged) data, filter where the sum of actions is greater than 0, or simply filter for `action = 1`or`action = 'added'`. The `log_id`on each row can be used to identify duplicates.

### Where can I get help?

Join **#onchain-data** in the CDP Discord to connect with our team and other developers.


## Token Balances

# Welcome to Token Balances API

## Overview

The Token Balances API enables you to retrieve public token balances of addresses on Base. This includes tokens (i.e. [ERC-20s](https://ethereum.org/en/developers/docs/standards/tokens/erc-20/ and the native gas tokens.

You can retrieve public token balances using the [REST API](/api-reference/v2/rest-api/evm-token-balances/list-evm-token-balances) or [CDP SDK](/data/token-balance/cdp-sdk).


> Note:
**Need balances for wallets you own?** Use the [Wallet API](/server-wallets/v2/using-the-wallet-api/token-balances).

## Core capabilities

* **Lightning-fast performance**: Sub-1s query latency (P99) with real-time data updates within 1 second from tip of chain
* **Standardized responses**: Unified data format with 99.9%+ uptime
* **Universal address queries**: Access public balance data for addresses without ownership requirements
* **Comprehensive token coverage**: Returns both native ETH and ERC-20 token balances

## Base support and performance

The Token Balances API supports both Base Mainnet and Base Sepolia testnet with sub-1 second P99 latency. Base Mainnet tracks all tokens, while Base Sepolia tracks the top 100 most active token addresses for that network.

The API uses a two-step process: first checking a database to find which tokens an address owns, then reading the exact balance from the token's smart contract to ensure fast responses with accurate amounts.

## Use cases

* **Portfolio Tracker dApp**: Build a real-time portfolio tracker that monitors Base Mainnet whale wallets. Track how top addresses like [exchange wallets](https://basescan.org/address/0x835678a611b28684005a5e2233695fb6cbbb0007) allocate their holdings across different tokens.

* **DeFi Analytics Dashboard**: Create analytics tools that analyze token distribution patterns. Monitor how DeFi protocols' treasury addresses evolve over time or track liquidity provider positions across multiple DEXs.

* **Trading Infrastructure**: Develop arbitrage bots that monitor specific addresses for balance changes. Enable pre-trade balance verification, market maker inventory tracking, and quick reaction to large holder movements.

* **Compliance & Risk Management**: Build KYC/AML solutions that monitor address activity. Track token flows between addresses, generate audit trails, and flag suspicious patterns in real-time.

## What to read next

* **[REST API Reference](/api-reference/v2/rest-api/evm-token-balances/list-evm-token-balances)**: Complete API documentation
* **[CDP SDK Guide](/data/token-balance/cdp-sdk)**: Get started with the SDK


# Token Balances SDK

## Overview

The CDP SDK allows you to retrieve token balances of an address using the`listTokenBalances`method for Base. For Solana token balances, use the [REST API](/api-reference/v2/rest-api/solana-token-balances/list-solana-token-balances) directly.

Additional information can be found in our [SDK Reference](https://coinbase.github.io/cdp-sdk/typescript/classes/Client.EvmClient.html#listtokenbalances)

In this guide, you will learn how to retrieve ERC-20 and native gas token balances of an address on Base networks.

## Prerequisites

* [Node.js](https://nodejs.org/en/download/) installed
* A free account logged in on [CDP Portal](https://portal.cdp.coinbase.com) and a [Secret API key](https://portal.cdp.coinbase.com/projects/api-keys)

### Configure


### Step: Install dependencies
#### Command```bash
npm install @coinbase/cdp-sdk dotenv
```### Step: Create an .env file
Create a`.env`file in your project root:
#### Command```bash
touch .env
```### Step: Add API credentials
If you downloaded your CDP API key as a JSON file, it will look like this. Otherwise, you can copy the values directly from the CDP Portal:
#### JSON```json
{
 "id": "3008043e-4528-46b7-82ff-111111111111",
 "privateKey": "a-long-base64-encoded-string"
}
```Copy these values into your`.env`file:
#### Command```bash
CDP_API_KEY_ID=3008043e-4528-46b7-82ff-111111111111
CDP_API_KEY_SECRET=a-long-base64-encoded-string
```## Example

In the example below, we query token balances for a known exchange address on Base mainnet.

<CodeGroup>
#### Code```ts
 import { CdpClient } from "@coinbase/cdp-sdk";
 import "dotenv/config";

 const cdp = new CdpClient;

 // Check token balances for a known exchange wallet with many tokens
 const walletAddress = "0x835678a611b28684005a5e2233695fb6cbbb0007";
 const network = "base"; // Base mainnet

 const result = await cdp.evm.listTokenBalances({
address: walletAddress,
network: network,
 });

 console.log(`Checking wallet: ${walletAddress}`);
 console.log(`Network: ${network}\n`);

 result.balances.forEach((item) => {
// Token amounts are stored as large integers on-chain
// We divide by 10^decimals to get the human-readable amount
const readableAmount = Number(item.amount.amount) / Math.pow(10, item.amount.decimals);

// The address 0xEeee... represents native ETH (not an ERC-20 token)
if (item.token.contractAddress === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE') {
 console.log(`ETH: ${readableAmount.toFixed(6)}`);
} else {
 console.log(`Token: ${readableAmount.toFixed(2)} (contract: ${item.token.contractAddress})`);
}
 });
```</CodeGroup>

After running the snippet above, you should see the following output:```console
Checking wallet: 0x835678a611b28684005a5e2233695fb6cbbb0007
Network: base

Token: 150.00 (contract: 0x1198CabDb2b9fF79EC8CbaFfB8977DAF74AFa25a)
Token: 87331987.01 (contract: 0x6D51bC9d512072B6399B81c73F02ba935B2771e5)
Token: 11000.00 (contract: 0x260b9AC75753FbD67F2Ea6D10724dd89a52C1913)
Token: 1261267.05 (contract: 0x3A95F48Cb4c04Eb0EC2a54d72DAA9e1138D9238d)
Token: 2900.00 (contract: 0x1aD2449781a03197BD6A072598Ac311B8bA1f5BD)
Token: 3086.69 (contract: 0xd6e03dEd9Cf9213b207E69570561E08cc3BC681e)
```This output shows:

* **Token balances**: Each ERC-20 token with its amount and contract address
* **Contract addresses**: The long hex strings identify each specific token contract on Base mainnet
* **Large holdings**: This exchange wallet holds millions of various tokens

## Sample response

The token balance response provides detailed token information:
#### JSON```json
{
 "balances": [
{
 "token": {
"network": "base",
"symbol": "ETH",
"name": "Ether",
"contractAddress": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
 },
 "amount": {
"amount": "1250000000000000000",
"decimals": 18
 }
}
 ],
 "nextPageToken": "..."
}
```### Response fields

| Field | Description |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
|`balances`| The list of EVM token balances. |
|`amount`| Amount of a given token in JSON format, includes`amount`, denominated in the smallest indivisible unit of the token; and `decimals`. |
| `token`| General information about a token in JSON format. |
|`network`| Name of the blockchain network, e.g.`base`. |
| `symbol`| The symbol of the ERC-20 or native gas token, e.g.`ETH`. |
| `name`| The name of the ERC-20 or native gas token, e.g.`Ether`. |
| `contractAddress`| Address of the ERC-20 or native gas token smart contract. |
|`nextPageToken`| The token for the next page of items, if any. |

## Pagination`listTokenBalances`supports paginated responses for addresses with many balances:

<CodeGroup>
#### Code```ts
 import { CdpClient } from "@coinbase/cdp-sdk";

 const cdp = new CdpClient;

 const page = await cdp.evm.listTokenBalances({
address: "0x835678a611b28684005a5e2233695fb6cbbb0007",
network: "base",
pageSize: 5
 });

 const nextPage = await cdp.evm.listTokenBalances({
address: "0x835678a611b28684005a5e2233695fb6cbbb0007",
network: "base",
pageToken: page.nextPageToken
 });
```
```python
 from cdp import CdpClient

 page = await cdp.evm.list_token_balances(
 address="0x835678a611b28684005a5e2233695fb6cbbb0007",
 network="base",
 page_size=5
 )

 next_page = await cdp.evm.list_token_balances(
 address="0x835678a611b28684005a5e2233695fb6cbbb0007",
 network="base",
 page_token=page.next_page_token
 )
```</CodeGroup>

## What to read next

* **[SDK Reference](https://coinbase.github.io/cdp-sdk/typescript/classes/Client.EvmClient.html#listtokenbalances SDK documentation for Base`listTokenBalances`* **[Base API Reference](/api-reference/v2/rest-api/evm-token-balances/list-evm-token-balances)**: Base REST API endpoint details
* **[Solana API Reference](/api-reference/v2/rest-api/solana-token-balances/list-solana-token-balances)**: Solana REST API endpoint details


## Address History

# Welcome to Address History

The Address History API provides indexed onchain data across multiple blockchain networks, offering comprehensive information on asset transactions and balance histories.

Unlike the SQL API which allows custom queries across all Base blockchain data, Address History focuses specifically on wallet-centric JSON RPC operations with pre-built endpoints.

Key features include:

* **Multi-chain support**: Query wallet data across different blockchains
* **Asset transaction history**: Get all transactions for a specific wallet address
* **Balance history tracking**: Track balance changes over time
* **Indexed data for efficient queries**: Fast responses without complex query writing
* **Simple API endpoints**: No SQL knowledge required

There are various ways to query address history data, including:

* [JSON-RPC](/api-reference/json-rpc-api/address-history)
* [CDP API](/api-reference/introduction) e.g. [ListBalanceHistories](/api-reference/rest-api/addresses/get-address-balance-history-for-asset)
* [CDP SDK](https://coinbase.github.io/coinbase-sdk-nodejs/index.html) e.g. [NodeJS address.listHistoricalBalance](https://coinbase.github.io/coinbase-sdk-nodejs/classes/coinbase_address.Address.html#listHistoricalBalances)

Here are some [quickstart examples](https://github.com/coinbase/coinbase-sdk-nodejs/tree/master/quickstart-template) for using the Address History API.




## API REFERANCE

## CDP API V1

# Welcome to CDP APIs

> The Coinbase Developer Platform (CDP) APIs allow you to safely and securely connect to CDP suite of backend services to easily build onchain apps.

## Introduction

[CDP](https://www.coinbase.com/developer-platform) is a large suite of onchain crypto services built by Coinbase, allowing you to focus on your core business logic
without worrying about the complexities of the blockchain.

The following API pages details how to connect to these services to build crypto-native, onchain applications.

## Getting Started

To get started, please visit one of the following pages:

* [Authentication](/api-reference/authentication)
* [Supported Networks](/api-reference/networks)

## Docs

For walkthroughs, demo apps, and guides related to the various APIs available through CDP, please visit the following pages:

* [CDP demo apps](/get-started/demo-apps/explore) - Sample apps leveraging the CDP APIs


# API Authentication


> Note:
**Looking for other authentication documentation?**

 * **Coinbase App APIs**: For accessing consumer Coinbase accounts, see [Coinbase App Authentication](/coinbase-app/authentication-authorization/api-key-authentication)
 * **CDP v2 APIs**: For the latest CDP authentication with Ed25519 support, see [CDP v2 Authentication](/api-reference/v2/authentication)

Coinbase Developer Platform (CDP) uses server and client API keys to authenticate access.

* **Secret API Keys:** For server-to-server communication (i.e., REST APIs).
* **Client API Keys:** For client-side communication (i.e., JSON-RPC).

For more information, see [CDP API Keys](/get-started/authentication/cdp-api-keys).

## Prerequisites

It is assumed you are logged into an existing CDP account (if not, [create one](https://portal.cdp.coinbase.com/create-account)

## 1. Create an API key

Your CDP account should include a project by default.

Navigate to your API keys dashboard. From the top drop-down, select your desired project.

![](https://mintcdn.com/coinbase-prod/bBDWUW6bnEBCR5Aa/api-reference/images/api-key-dash.png?fit=max&auto=format&n=bBDWUW6bnEBCR5Aa&q=85&s=8c98f1438def7aa16a587bd649817802)
Continue reading based on the type of API key you need to create.

### Server

To create a Secret API key (for server-to-server communication), ensure the **Secret API Keys** tab is selected as shown in the previous step.

Click the **Create API key** button and give your key a name.

You also have the option to:

* Set an IP allowlist for the key
* Restrict granular permissions such as the ability to trade or transfer funds
* Select between Ed25519 (Recommended) or ECDSA [signature algorithms](/get-started/authentication/cdp-api-keys#ed25519-signature-algorithm)

When you are satisfied with your key configuration, click **Create API key**:

![](https://mintcdn.com/coinbase-prod/bBDWUW6bnEBCR5Aa/api-reference/images/api-keys-create.svg?fit=max&auto=format&n=bBDWUW6bnEBCR5Aa&q=85&s=60a245633d0154cdefdcf089f7a5f68e)
A modal will appear with your key details.

![](https://mintcdn.com/coinbase-prod/bBDWUW6bnEBCR5Aa/api-reference/images/api-keys-details.svg?fit=max&auto=format&n=bBDWUW6bnEBCR5Aa&q=85&s=b83017a6665156985d1cab0bb0fc4fef)
Make sure you save the API key ID and Secret in a safe place.

<Info>
 **Optional API Key File Download**

 For enhanced security, API key files are no longer automatically downloaded. If you need to reference your API key via file path in your code, click the **Download API key** button in the modal to save the key file. However, it is recommended to copy the key details directly from the modal and use them as environment variables for better security.
</Info>


> Note:
To regenerate a Secret API key, click **Configure** to delete and recreate the key.

Now, you are ready to use our REST and server-side APIs!

### Client

To create a Client API key (for use in front-end components) ensure the **Client API Key** tab is selected.

![](https://mintcdn.com/coinbase-prod/bBDWUW6bnEBCR5Aa/api-reference/images/cdp-client-api-key.png?fit=max&auto=format&n=bBDWUW6bnEBCR5Aa&q=85&s=5990e9f1b08ebb39224e043045073db8)
Copy the Client API key and export it as an environment variable:```export CLIENT_API_KEY="your_client_api_key"```> Note:
Click the **Rotate** button to expire this key and generate a new one.

Proceed to [Step 3](#3-authenticate).

## 2. Generate JWT (Server only)

You can generate a JSON Web Token (JWT) using the following code snippets.


 A JWT is a compact, self-contained, stateless token format used to securely transmit API keys as a JSON object for authentication with the CDP API.

 Read more in our [JWT documentation](/get-started/authentication/cdp-api-keys#learn-more-about-jwts).


Continue reading to:

* Set up your environment for JWT generation by configuring environment variables and installing dependencies
* Export your generated JWT as an environment variable


> Warning:
Never include Secret API key information in your code.

 Instead, securely store it and retrieve it from an environment variable, a secure database, or other storage mechanism intended for highly-sensitive parameters.

### Setup

To begin, export the following environment variables:

*`KEY_NAME`: The name of the API key you want to use
* `KEY_SECRET`: The secret of the API key you want to use
* `REQUEST_METHOD`: The HTTP method of the endpoint you want to target
* `REQUEST_PATH`: The path of the endpoint you want to target
* `REQUEST_HOST`: The host of the endpoint you want to target

For example:
```export KEY_NAME="organizations/{org_id}/apiKeys/{key_id}"
export KEY_SECRET="-----BEGIN EC PRIVATE KEY-----\nYOUR PRIVATE KEY\n-----END EC PRIVATE KEY-----\n"
export REQUEST_METHOD="GET"
export REQUEST_PATH="/api/v3/brokerage/accounts"
export REQUEST_HOST="api.coinbase.com"```> Warning:
Newlines must be preserved to properly parse the key secret. Do this on one line by using \n to escape new lines, or via a multi-line string.

Complete the remaining setup steps for JWT generation below according to your language choice.

<Tabs groupId="programming-language">
 <Tab value="python" title="Python">
 Install required dependencies:```pip install PyJWT==2.8.0
pip install cryptography==42.0.5```</Tab>

 <Tab value="javascript" title="JavaScript">
 Install required dependencies:```npm install jsonwebtoken```</Tab>

 <Tab value="typescript" title="TypeScript">
 Install required dependencies:
#### Command```bash
npm install jsonwebtoken
npm install @types/jsonwebtoken
npm install -g typescript
```</Tab>

 <Tab value="go" title="Go">
 You can create a new project directory, but we will handle the bulk of Go in the [Export](api-reference/authentication#export) section below.```mkdir go-jwt-example```</Tab>

 <Tab value="Ruby" title="Ruby">
 Install required dependencies:```gem install JWT
gem install OpenSSL```</Tab>

 <Tab value="php" title="PHP">
 Add required dependencies:```composer require firebase/php-jwt
composer require vlucas/phpdotenv```</Tab>

 <Tab value="java" title="Java">
 Add required dependencies:

 *`nimbus-jose-jwt`(9.39)
 *`bcpkix-jdk18on`(1.78)
 *`java-dotenv`(5.2.2)

 For example, for a Maven`pom.xml`:
```xml
<dependency>
<groupId>com.nimbusds</groupId>
<artifactId>nimbus-jose-jwt</artifactId>
<version>9.39</version>
</dependency>

<dependency>
<groupId>org.bouncycastle</groupId>
<artifactId>bcpkix-jdk18on</artifactId>
<version>1.78</version>
</dependency>

<dependency>
<groupId>io.github.cdimascio</groupId>
<artifactId>java-dotenv</artifactId>
<version>5.2.2</version>
</dependency>
```Or, for Gradle`build.gradle`:
```gradle
implementation 'com.nimbusds:nimbus-jose-jwt:9.39'
implementation 'org.bouncycastle:bcpkix-jdk18on:1.78'
implementation 'io.github.cdimascio:java-dotenv:5.2.2'
```</Tab>

 <Tab value="c++" title="C++">
 Install required dependencies:```apt-get update
apt-get install libcurlpp-dev libssl-dev
git clone https://github.com/Thalhammer/jwt-cpp
cd jwt-cpp
mkdir build && cd build
cmake ..
make
make install```</Tab>

 <Tab value="c#" title="C#">
 Install required dependencies:```dotnet add package Microsoft.IdentityModel.Tokens
dotnet add package System.IdentityModel.Tokens.Jwt
dotnet add package Jose-JWT```</Tab>
</Tabs>

###

### Export

Now that your environment is setup, you can create the code to generate the JWT and export it as an environment variable.

<Info>
 Your JWT is valid for 2 minutes. After 2 minutes, you will need to generate a new JWT to ensure uninterrupted access to the CDP APIs.
</Info>

<Tabs groupId="programming-language">
 <Tab value="python" title="Python">
 Create a new file for JWT generation code:```touch main.py```It should contain the following:```python
import jwt
from cryptography.hazmat.primitives import serialization
import time
import secrets
import os 

# Fetch values from exported environment variables
key_name = os.getenv('KEY_NAME') 
key_secret = os.getenv('KEY_SECRET') 
request_method = os.getenv('REQUEST_METHOD') 
request_host = os.getenv('REQUEST_HOST') 
request_path = os.getenv('REQUEST_PATH') 

def build_jwt(uri):
private_key_bytes = key_secret.encode('utf-8')
private_key = serialization.load_pem_private_key(private_key_bytes, password=None)
jwt_payload = {
'sub': key_name,
'iss': "cdp",
'nbf': int(time.time),
'exp': int(time.time) + 120,
'uri': uri,
}
jwt_token = jwt.encode(
jwt_payload,
private_key,
algorithm='ES256',
headers={'kid': key_name, 'nonce': secrets.token_hex},
)
return jwt_token
def main:
uri = f"{request_method} {request_host}{request_path}"
jwt_token = build_jwt(uri)
print(jwt_token)
if __name__ == "__main__":
main
```Finally, run the script to generate the JWT output and export it as an environment variable.```python
export JWT=$(python main.py)
echo $JWT
```</Tab>

 <Tab value="javascript" title="JavaScript">
 Create a new file for JWT generation code:```touch main.js```It should contain the following:```javascript
const { sign } = require("jsonwebtoken");
const crypto = require("crypto");

// Fetch environment variables
const key_name = process.env.KEY_NAME;
const key_secret = process.env.KEY_SECRET;
const request_method = process.env.REQUEST_METHOD;
const request_host = process.env.REQUEST_HOST;
const request_path = process.env.REQUEST_PATH;

const algorithm = "ES256";
const uri = `${request_method} ${request_host}${request_path}`;

const token = sign(
 {
iss: "cdp",
nbf: Math.floor(Date.now / 1000),
exp: Math.floor(Date.now / 1000) + 120, // JWT expires in 120 seconds
sub: key_name,
uri,
 },
 key_secret,
 {
algorithm,
header: {
 kid: key_name,
 nonce: crypto.randomBytes(16).toString("hex"),
},
 }
);

console.log("export JWT=" + token);
```Finally, run the script to generate the JWT output and export it as an environment variable.
#### Command```bash
export JWT=$(node main.js)
echo $JWT
```</Tab>

 <Tab value="typescript" title="TypeScript">
 Create a new file for JWT generation code:```touch main.ts```It should contain the following:
#### Code```typescript
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';

// Fetch environment variables
const keyName = process.env.KEY_NAME!;
const keySecret = process.env.KEY_SECRET!;
const requestMethod = process.env.REQUEST_METHOD!;
const requestHost = process.env.REQUEST_HOST!;
const requestPath = process.env.REQUEST_PATH!;
const algorithm = 'ES256'; // Not an environment variable

// Construct the URI
const uri = `${requestMethod} ${requestHost}${requestPath}`;

const generateJWT = : string => {
const payload = {
iss: 'cdp',
nbf: Math.floor(Date.now / 1000),
exp: Math.floor(Date.now / 1000) + 120, // JWT expires in 120 seconds
sub: keyName,
uri,
};

const header = {
alg: algorithm,
kid: keyName,
nonce: crypto.randomBytes(16).toString('hex'),
};

return jwt.sign(payload, keySecret, { algorithm, header });
};

const main = => {
const token = generateJWT;
console.log("export JWT=" + token);
};

main;
```Finally, compile and run the script to generate the JWT output and export it as an environment variable.
#### Command```bash
tsc main.ts
export JWT=$(node main.js)
echo $JWT
```</Tab>

 <Tab value="go" title="Go">
 Create a new file for JWT generation code:```touch main.go```It should contain the following:```go
package main

import (
	"crypto/rand"
	"crypto/x509"
	"encoding/pem"
	"fmt"
	"math"
	"math/big"
	"os"
	"time"

	log "github.com/sirupsen/logrus"
	"gopkg.in/go-jose/go-jose.v2"
	"gopkg.in/go-jose/go-jose.v2/jwt"
)

type APIKeyClaims struct {
	*jwt.Claims
	URI string `json:"uri"`}

func buildJWT(uri string) (string, error) {
	// Get private key from environment variable
	keySecret := os.Getenv("KEY_SECRET")
	if keySecret == "" {
 return "", fmt.Errorf("KEY_SECRET environment variable is required")
	}

	// Decode the private key
	block, _ := pem.Decode([]byte(keySecret))
	if block == nil {
 return "", fmt.Errorf("jwt: Could not decode private key")
	}

	key, err := x509.ParseECPrivateKey(block.Bytes)
	if err != nil {
 return "", fmt.Errorf("jwt: %w", err)
	}

	// Create a signer using the private key
	sig, err := jose.NewSigner(
 jose.SigningKey{Algorithm: jose.ES256, Key: key},
 (&jose.SignerOptions{NonceSource: nonceSource{}}).WithType("JWT").WithHeader("kid", os.Getenv("KEY_NAME")),
	)
	if err != nil {
 return "", fmt.Errorf("jwt: %w", err)
	}

	// Prepare JWT claims
	cl := &APIKeyClaims{
 Claims: &jwt.Claims{
 Subject: os.Getenv("KEY_NAME"),
 Issuer: "cdp",
 NotBefore: jwt.NewNumericDate(time.Now),
 Expiry: jwt.NewNumericDate(time.Now.Add(2 * time.Minute)),
 },
 URI: uri,
	}

	// Sign and serialize the JWT
	jwtString, err := jwt.Signed(sig).Claims(cl).CompactSerialize
	if err != nil {
 return "", fmt.Errorf("jwt: %w", err)
	}
	return jwtString, nil
}

var max = big.NewInt(math.MaxInt64)

type nonceSource struct{}

// Generate a nonce using a random number generator
func (n nonceSource) Nonce (string, error) {
	r, err := rand.Int(rand.Reader, max)
	if err != nil {
 return "", err
	}
	return r.String, nil
}

func main {
	// Get request method, host, and path from environment variables
	requestMethod := os.Getenv("REQUEST_METHOD")
	if requestMethod == "" {
 requestMethod = "GET" // Default to "GET" if not set
	}
	requestHost := os.Getenv("REQUEST_HOST")
	if requestHost == "" {
 requestHost = "api.coinbase.com" // Default host if not set
	}
	requestPath := os.Getenv("REQUEST_PATH")
	if requestPath == "" {
 requestPath = "/api/v3/brokerage/accounts" // Default path if not set
	}

	// Construct the URI
	uri := fmt.Sprintf("%s %s%s", requestMethod, requestHost, requestPath)

	// Generate JWT
	jwt, err := buildJWT(uri)
	if err != nil {
 log.Errorf("error building jwt: %v", err)
	}
	fmt.Println(jwt)
}```Run the following to generate your modules and hashes:```go mod init jwt-generator
go mod tidy```Finally, run the script to generate the JWT output and export it as an environment variable.```export JWT=$(go run main.go)
echo $JWT```</Tab>

 <Tab value="ruby" title="Ruby">
 Create a new file for JWT generation code:```touch main.rb```It should contain the following:```ruby
require 'jwt'
require 'openssl'
require 'time'
require 'securerandom'

# Fetching environment variables
key_name = ENV['KEY_NAME']
key_secret = ENV['KEY_SECRET']
request_method = ENV['REQUEST_METHOD'] || 'GET' # Default to 'GET' if not set
request_host = ENV['REQUEST_HOST'] || 'api.coinbase.com' # Default host if not set
request_path = ENV['REQUEST_PATH'] || '/api/v3/brokerage/accounts' # Default path if not set

def build_jwt(uri)
 # Header for the JWT
 header = {
typ: 'JWT',
kid: key_name,
nonce: SecureRandom.hex(16)
 }

 # Claims for the JWT
 claims = {
sub: key_name,
iss: 'cdp',
aud: ['cdp_service'],
nbf: Time.now.to_i,
exp: Time.now.to_i + 120, # Expiration time: 2 minute from now.
uri: uri
 }

 # Read the private key from the environment variable
 private_key = OpenSSL::PKey::read(key_secret)
 
 # Encode the JWT
 JWT.encode(claims, private_key, 'ES256', header)
end

# Build the JWT with the URI
token = build_jwt("#{request_method.upcase} #{request_host}#{request_path}")

# Print the JWT token
puts token
```Finally, run the script to generate the JWT output and export it as an environment variable.```ruby main.rb
export JWT=$(ruby main.rb)
echo $JWT```</Tab>

 <Tab value="PHP" title="PHP">
 Create a new file for JWT generation code:```touch main.php```It should contain the following:```php
<?php
require 'vendor/autoload.php';
use Firebase\JWT\JWT;

function buildJwt {
// Fetching values directly from environment variables (no defaults)
$keyName = getenv('KEY_NAME'); 
$keySecret = str_replace('\\n', "\n", getenv('KEY_SECRET')); // Handling the private key format
$requestMethod = getenv('REQUEST_METHOD'); 
$requestHost = getenv('REQUEST_HOST');
$requestPath = getenv('REQUEST_PATH');

// Ensure that the environment variables are set
if (!$keyName || !$keySecret || !$requestMethod || !$requestHost || !$requestPath) {
throw new Exception('Required environment variables are missing');
}

// Constructing the URI from method, host, and path
$uri = $requestMethod . ' ' . $requestHost . $requestPath;

// Loading the private key
$privateKeyResource = openssl_pkey_get_private($keySecret);
if (!$privateKeyResource) {
throw new Exception('Private key is not valid');
}

// Setting the current time and creating a unique nonce
$time = time;
$nonce = bin2hex(random_bytes(16)); // Generate a 32-character hexadecimal nonce

// JWT Payload
$jwtPayload = [
'sub' => $keyName,
'iss' => 'cdp',
'nbf' => $time,
'exp' => $time + 120, // Token valid for 120 seconds from now
'uri' => $uri,
];

// JWT Header
$headers = [
'typ' => 'JWT',
'alg' => 'ES256',
'kid' => $keyName, // Key ID header for JWT
'nonce' => $nonce // Nonce included in headers for added security
];

// Encoding JWT with private key
$jwtToken = JWT::encode($jwtPayload, $privateKeyResource, 'ES256', $keyName, $headers);
return $jwtToken;
}

// Example of calling the function to generate the JWT
try {
$jwt = buildJwt;
echo "JWT Token: " . $jwt . "\n";
} catch (Exception $e) {
echo "Error generating JWT: " . $e->getMessage . "\n";
}
```Finally, run the script to generate the JWT output and export it as an environment variable.```php main.php
export JWT=$(php main.php)
echo $JWT```</Tab>

 <Tab value="java" title="Java">
 Create a new file for JWT generation code:```touch Main.java```It should contain the following:```java
import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.*;
import com.nimbusds.jwt.*;
import java.security.interfaces.ECPrivateKey;
import java.util.Map;
import java.util.HashMap;
import java.time.Instant;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.bouncycastle.openssl.PEMParser;
import org.bouncycastle.openssl.jcajce.JcaPEMKeyConverter;
import java.security.PrivateKey;
import java.security.Security;
import java.security.KeyFactory;
import java.security.spec.PKCS8EncodedKeySpec;
import java.io.StringReader;

public class Main {
public static void main(String[] args) throws Exception {
// Register BouncyCastle as a security provider
Security.addProvider(new BouncyCastleProvider);

// Load environment variables directly
String privateKeyPEM = System.getenv("PRIVATE_KEY").replace("\\n", "\n");
String name = System.getenv("KEY_NAME");
String requestMethod = System.getenv("REQUEST_METHOD");
String requestHost = System.getenv("REQUEST_HOST");
String requestPath = System.getenv("REQUEST_PATH");

// Ensure all environment variables are provided
if (privateKeyPEM == null || name == null || requestMethod == null || requestHost == null || requestPath == null) {
 throw new IllegalArgumentException("Required environment variables are missing");
}

// Create header object
Map<String, Object> header = new HashMap<>;
header.put("alg", "ES256");
header.put("typ", "JWT");
header.put("kid", name);
header.put("nonce", String.valueOf(Instant.now.getEpochSecond));

// Create URI string for current request
String uri = requestMethod + " " + requestHost + requestPath;

// Create data object
Map<String, Object> data = new HashMap<>;
data.put("iss", "cdp");
data.put("nbf", Instant.now.getEpochSecond);
data.put("exp", Instant.now.getEpochSecond + 120); // Token valid for 120 seconds from now
data.put("sub", name);
data.put("uri", uri);

// Load private key
PEMParser pemParser = new PEMParser(new StringReader(privateKeyPEM));
JcaPEMKeyConverter converter = new JcaPEMKeyConverter.setProvider("BC");
Object object = pemParser.readObject;
PrivateKey privateKey;

if (object instanceof PrivateKey) {
 privateKey = (PrivateKey) object;
} else if (object instanceof org.bouncycastle.openssl.PEMKeyPair) {
 privateKey = converter.getPrivateKey(((org.bouncycastle.openssl.PEMKeyPair) object).getPrivateKeyInfo);
} else {
 throw new Exception("Unexpected private key format");
}
pemParser.close;

// Convert to ECPrivateKey
KeyFactory keyFactory = KeyFactory.getInstance("EC");
PKCS8EncodedKeySpec keySpec = new PKCS8EncodedKeySpec(privateKey.getEncoded);
ECPrivateKey ecPrivateKey = (ECPrivateKey) keyFactory.generatePrivate(keySpec);

// Create JWT
JWTClaimsSet.Builder claimsSetBuilder = new JWTClaimsSet.Builder;
for (Map.Entry<String, Object> entry : data.entrySet) {
 claimsSetBuilder.claim(entry.getKey, entry.getValue);
}
JWTClaimsSet claimsSet = claimsSetBuilder.build;

JWSHeader jwsHeader = new JWSHeader.Builder(JWSAlgorithm.ES256).customParams(header).build;
SignedJWT signedJWT = new SignedJWT(jwsHeader, claimsSet);

JWSSigner signer = new ECDSASigner(ecPrivateKey);
signedJWT.sign(signer);

String sJWT = signedJWT.serialize;
System.out.println(sJWT);
}
}
```Finally, compile the script and export the JWT output as an environment variable.```mvn compile
export JWT=$(mvn exec:java -Dexec.mainClass=Main)
echo $JWT```</Tab>

 <Tab value="c++" title="C++">
 Create a new file for JWT generation code:```touch main.cpp```It should contain the following:```cpp
#include <iostream>
#include <sstream>
#include <string>
#include <cstdlib> // for std::getenv
#include <openssl/evp.h>
#include <openssl/ec.h>
#include <openssl/pem.h>
#include <openssl/rand.h>
#include <jwt-cpp/jwt.h>

std::string create_jwt {
// Fetching environment variables
const char* key_name_env = std::getenv("KEY_NAME");
const char* key_secret_env = std::getenv("KEY_SECRET");
const char* request_method_env = std::getenv("REQUEST_METHOD");
const char* request_host_env = std::getenv("REQUEST_HOST");
const char* request_path_env = std::getenv("REQUEST_PATH");

// Ensure all environment variables are present
if (!key_name_env || !key_secret_env || !request_method_env || !request_host_env || !request_path_env) {
throw std::runtime_error("Missing required environment variables");
}

std::string key_name = key_name_env;
std::string key_secret = key_secret_env;
std::string request_method = request_method_env;
std::string request_host = request_host_env;
std::string request_path = request_path_env;

std::string uri = request_method + " " + request_host + request_path;

// Generate a random nonce
unsigned char nonce_raw[16];
RAND_bytes(nonce_raw, sizeof(nonce_raw));
std::string nonce(reinterpret_cast<char*>(nonce_raw), sizeof(nonce_raw));

// Create JWT token
auto token = jwt::create
.set_subject(key_name)
.set_issuer("cdp")
.set_not_before(std::chrono::system_clock::now)
.set_expires_at(std::chrono::system_clock::now + std::chrono::seconds{120})
.set_payload_claim("uri", jwt::claim(uri))
.set_header_claim("kid", jwt::claim(key_name))
.set_header_claim("nonce", jwt::claim(nonce))
.sign(jwt::algorithm::es256(key_name, key_secret));

return token;
}

int main {
try {
std::string token = create_jwt;
std::cout << "Generated JWT Token: " << token << std::endl;
} catch (const std::exception& e) {
std::cerr << "Error: " << e.what << std::endl;
return 1;
}
return 0;
}
```Finally, compile the script and export the JWT output as an environment variable.```g++ main.cpp -o myapp -lcurlpp -lcurl -lssl -lcrypto -I/usr/local/include -L/usr/local/lib -ljwt -std=c++17
export JWT=$(./main)
echo $JWT```</Tab>

 <Tab value="c#" title="C#">
 Create a new file for JWT generation code:```touch Main.cs```It should contain the following:```csharp
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Net.Http;
using System.Security.Cryptography;
using Microsoft.IdentityModel.Tokens;
using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.OpenSsl;
using Org.BouncyCastle.Security;
using System.IO;

namespace JwtTest
{
internal class Program
{
static void Main(string[] args)
{
 // Fetching environment variables directly
 string name = Environment.GetEnvironmentVariable("KEY_NAME");
 string cbPrivateKey = Environment.GetEnvironmentVariable("KEY_SECRET");
 string requestMethod = Environment.GetEnvironmentVariable("REQUEST_METHOD") ?? "GET";
 string requestHost = Environment.GetEnvironmentVariable("REQUEST_HOST") ?? "api.coinbase.com";
 string requestPath = Environment.GetEnvironmentVariable("REQUEST_PATH") ?? "/api/v3/brokerage/products";

 // Validate that all necessary environment variables are provided
 if (string.IsNullOrEmpty(name) || string.IsNullOrEmpty(cbPrivateKey) ||
 string.IsNullOrEmpty(requestMethod) || string.IsNullOrEmpty(requestHost) || string.IsNullOrEmpty(requestPath))
 {
 throw new InvalidOperationException("Missing required environment variables.");
 }

 string endpoint = requestMethod + " " + requestHost + requestPath;
 string token = GenerateToken(name, cbPrivateKey, endpoint);

 Console.WriteLine($"Generated Token: {token}");
 Console.WriteLine("Calling API...");
 Console.WriteLine(CallApiGET($"https://{requestHost}{requestPath} token));
}

static string GenerateToken(string name, string privateKeyPem, string uri)
{
 // Load EC private key using BouncyCastle
 var ecPrivateKey = LoadEcPrivateKeyFromPem(privateKeyPem);

 // Create security key from the manually created ECDsa
 var ecdsa = GetECDsaFromPrivateKey(ecPrivateKey);
 var securityKey = new ECDsaSecurityKey(ecdsa);

 // Signing credentials
 var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.EcdsaSha256);

 var now = DateTimeOffset.UtcNow;

 // Header and payload
 var header = new JwtHeader(credentials);
 header["kid"] = name;
 header["nonce"] = GenerateNonce; // Generate dynamic nonce

 var payload = new JwtPayload
 {
 { "iss", "coinbase-cloud" },
 { "sub", name },
 { "nbf", now.ToUnixTimeSeconds },
 { "exp", now.AddMinutes(2).ToUnixTimeSeconds },
 { "uri", uri }
 };

 var token = new JwtSecurityToken(header, payload);

 var tokenHandler = new JwtSecurityTokenHandler;
 return tokenHandler.WriteToken(token);
}

// Method to generate a dynamic nonce
static string GenerateNonce(int length = 64)
{
 byte[] nonceBytes = new byte[length / 2]; // Allocate enough space for the desired length (in hex characters)
 using (var rng = RandomNumberGenerator.Create)
 {
 rng.GetBytes(nonceBytes);
 }
 return BitConverter.ToString(nonceBytes).Replace("-", "").ToLower; // Convert byte array to hex string
}

// Method to load EC private key from PEM using BouncyCastle
static ECPrivateKeyParameters LoadEcPrivateKeyFromPem(string privateKeyPem)
{
 using (var stringReader = new StringReader(privateKeyPem))
 {
 var pemReader = new PemReader(stringReader);
 var keyPair = pemReader.ReadObject as AsymmetricCipherKeyPair;
 if (keyPair == null)
 throw new InvalidOperationException("Failed to load EC private key from PEM");

 return (ECPrivateKeyParameters)keyPair.Private;
 }
}

// Method to convert ECPrivateKeyParameters to ECDsa
static ECDsa GetECDsaFromPrivateKey(ECPrivateKeyParameters privateKey)
{
 var q = privateKey.Parameters.G.Multiply(privateKey.D).Normalize;
 var qx = q.AffineXCoord.GetEncoded;
 var qy = q.AffineYCoord.GetEncoded;

 var ecdsaParams = new ECParameters
 {
 Curve = ECCurve.NamedCurves.nistP256, // Adjust if you're using a different curve
 Q =
 {
 X = qx,
 Y = qy
 },
 D = privateKey.D.ToByteArrayUnsigned
 };

 return ECDsa.Create(ecdsaParams);
}

// Method to call the API with a GET request
static string CallApiGET(string url, string bearerToken = "")
{
 using (var client = new HttpClient)
 {
 using (var request = new HttpRequestMessage(HttpMethod.Get, url))
 {
 if (!string.IsNullOrEmpty(bearerToken))
 request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", bearerToken);
 var response = client.SendAsync(request).Result;

 if (response != null)
 return response.Content.ReadAsStringAsync.Result;
 else
 return "";
 }
 }
}
}
}
```Finally, build and run the project.```dotnet build
dotnet run```</Tab>
</Tabs>

## 3. Authenticate

### Server

To authenticate your server-side code, use the JWT token you generated in the previous step as a [Bearer Token](https://swagger.io/docs/specification/v3_0/authentication/bearer-authentication/) within your request:
#### Command```bash
export API_ENDPOINT="https://$REQUEST_HOST$REQUEST_PATH

# Now, use that endpoint in your curl command
curl -L -X "$HTTP_METHOD" "$API_ENDPOINT" \
 -H "Authorization: Bearer $JWT" \
 -H "Content-Type: application/json" \
 -H "Accept: application/json"
```As an example, [Get Asset by ID](/api-reference/rest-api/assets/get-assets-by-id) could be requested like so:
#### Command```bash
curl -L -X POST "https://api.cdp.coinbase.com/platform/v1/networks/base-mainnet/assets/BTC \
 -H "Authorization: Bearer ${JWT}" \
 -H "Content-Type: application/json" \
 -H "Accept: application/json"
```### Client

To authenticate your client-side code, include it with your JSON-RPC request:
#### Command```bash
curl -L -X https://api.developer.coinbase.com/rpc/v1/base/${CLIENT_API_KEY} \
 -H "Content-Type: application/json" \
 -d '${REQUEST_BODY_JSON}'
```As an example, you can request the [List Historical Balances](/api-reference/json-rpc-api/address-history#cdp-listbalancehistories) JSON-RPC endpoint like so:
#### Command```bash
curl -L -X https://api.developer.coinbase.com/rpc/v1/base/${CLIENT_API_KEY} \
 -H "Content-Type: application/json" \
 -d '{"jsonrpc": "2.0", "id": 1, "method": "cdp_listBalances", "params": [{"address":"0xF7DCa789B08Ed2F7995D9bC22c500A8CA715D0A8","pageToken":"","pageSize":1}]}'
```## What to read next

* **[Security Best Practices](/get-started/authentication/security-best-practices)**: Learn how to secure your API keys and other sensitive information.
* **[CDP API Keys](/get-started/authentication/cdp-api-keys)**: Learn how to create and manage your API keys.
* **[JWT Authentication](/get-started/authentication/jwt-authentication)**: More information on JWT authentication.
* **[CDP cURL](/get-started/authentication/cdp-curl)**: Learn how to use our CLI tool to interact with the CDP API.
* **[Postman Files](/get-started/authentication/postman-files)**: Download our Postman collection and environment files to get started.


# Networks

The networks described here are supported by CDP REST and JSON-RPC APIs described in the left-hand nav.

## REST API

A comprehensive list of CDP APIs offered across the networks we support, along with their corresponding testnets.

### Base

| API | Base Mainnet | Base Sepolia |
| :-------------------------------------------------------------------------------------------------------------- | :----------- | :----------- |
| [Addresses](/server-wallets/v1/concepts/addresses) | ✅ | ✅ |
| [Assets](/server-wallets/v1/concepts/assets) | ✅ | ✅ |
| [Faucet](/faucets/introduction/welcome) | - | ✅ |
| [Networks](/api-reference/rest-api/networks/get-network-by-id) | ✅ | ✅ |
| [Paymaster](/paymaster/introduction/welcome) | ✅ | ✅ |
| [Send](/server-wallets/v1/concepts/transfers) | ✅ | ✅ |
| [Smart Contract Interactions](/server-wallets/v1/introduction/onchain-interactions/smart-contract-interactions) | ✅ | ✅ |
| [Staking](/staking/staking-api/introduction/welcome) | - | - |
| [Trades](/server-wallets/v1/concepts/trades) | ✅ | - |
| [Server Wallet](/server-wallets/v1/concepts/wallets) | ✅ | ✅ |
| [Webhooks](/webhooks/overview) | ✅ | ✅ |

<Info>
 When constructing a REST API request for Base, use`base-mainnet`or`base-sepolia`as the [network identifier](#network-identifiers).
</Info>

### Ethereum

| API | Ethereum Mainnet | Ethereum Sepolia | Ethereum Hoodi |
| --------------------------------------------------------------------------------------------------------------- | ---------------- | ---------------- | -------------- |
| [Addresses](/server-wallets/v1/concepts/addresses) | ✅ | ✅ | ✅ |
| [Assets](/server-wallets/v1/concepts/assets) | ✅ | ✅ | - |
| [Faucet](/faucets/introduction/welcome) | - | ✅ | - |
| [Networks](/api-reference/rest-api/networks/get-network-by-id) | ✅ | ✅ | - |
| [Paymaster](/paymaster/introduction/welcome) | - | - | - |
| [Send](/server-wallets/v1/concepts/transfers) | ✅ | ✅ | - |
| [Smart Contract Interactions](/server-wallets/v1/introduction/onchain-interactions/smart-contract-interactions) | ✅ | - | - |
| [Staking](/staking/staking-api/introduction/welcome) | ✅ | - | ✅ |
| [Trades](/server-wallets/v1/concepts/trades) | ✅ | - | - |
| [Server Wallet](/server-wallets/v1/concepts/wallets) | ✅ | ✅ | - |
| [Webhooks](/webhooks/overview) | - | - | - |

<Info>
 When constructing a REST API request for Ethereum, use`ethereum-mainnet`,
 `ethereum-sepolia`or`ethereum-hoodi`as the [network
 identifier](#network-identifiers).
</Info>

### Solana

| API | Solana Mainnet | Solana Devnet |
| --------------------------------------------------------------------------------------------------------------- | -------------- | ------------- |
| [Addresses](/server-wallets/v1/concepts/addresses) | - | - |
| [Assets](/server-wallets/v1/concepts/assets) | - | - |
| [Faucet](/faucets/introduction/welcome) | - | - |
| [Networks](/api-reference/rest-api/networks/get-network-by-id) | - | - |
| [Paymaster](/paymaster/introduction/welcome) | - | - |
| [Send](/server-wallets/v1/concepts/transfers) | - | - |
| [Smart Contract Interactions](/server-wallets/v1/introduction/onchain-interactions/smart-contract-interactions) | - | - |
| [Staking](/staking/staking-api/introduction/welcome) | ✅ | ✅ |
| [Trades](/server-wallets/v1/concepts/trades) | - | - |
| [Server Wallet](/server-wallets/v1/concepts/wallets) | - | - |
| [Webhooks](/webhooks/overview) | - | - |

<Info>
 When constructing a REST API request for Solana, use`solana-mainnet`or`solana-devnet`as the [network identifier](#network-identifiers).
</Info>

### Others

We also support Arbitrum and Polygon.

| API | Arbitrum Mainnet | Polygon Mainnet |
| --------------------------------------------------------------------------------------------------------------- | ---------------- | --------------- |
| [Addresses](/server-wallets/v1/concepts/addresses) | ✅ | ✅ |
| [Assets](/server-wallets/v1/concepts/assets) | ✅ | ✅ |
| [Faucet](/faucets/introduction/welcome) | - | - |
| [Networks](/api-reference/rest-api/networks/get-network-by-id) | ✅ | ✅ |
| [Paymaster](/paymaster/introduction/welcome) | - | - |
| [Send](/server-wallets/v1/concepts/transfers) | ✅ | ✅ |
| [Smart Contract Interactions](/server-wallets/v1/introduction/onchain-interactions/smart-contract-interactions) | ✅ | ✅ |
| [Staking](/staking/staking-api/introduction/welcome) | - | - |
| [Trades](/server-wallets/v1/concepts/trades) | ✅ | ✅ |
| [Server Wallet](/server-wallets/v1/concepts/wallets) | ✅ | ✅ |
| [Webhooks](/webhooks/overview) | - | - |

<Info>
 When constructing a REST API request for Arbitrum or Polygon, use`arbitrum-mainnet`or`polygon-mainnet` as the [network
 identifier](#network-identifiers).
</Info>

## JSON-RPC API

[CDP Node](/data/node/overview) provides free, rate-limited RPC endpoints built for [Base](https://docs.base.org/) and the Base Sepolia testnet.

Free users are limited to approximately [50 requests per second](/data/node/overview#rate-limits). Please reach out in #node on our CDP Discord to request a limit increase.

### Base

| RPC namespace | Functionality | Base Mainnet | Base Sepolia |
| ------------------------------------------------------------- | -------------------------------------- | ------------ | ------------ |
| [`cdp_*`](/api-reference/json-rpc-api/address-history) | Historical address data | ✅ | ✅ |
| [`pm_*`](/api-reference/json-rpc-api/paymaster) | Gas sponsorship management (Paymaster) | ✅ | ✅ |
| [`eth_*`](/api-reference/json-rpc-api/core) | Base-specific EVM functionality | ✅ | ✅ |
| [`web3_*`](/api-reference/json-rpc-api/core#web3-namespace) | Client information | ✅ | ✅ |
| [`debug_*`](/api-reference/json-rpc-api/core#debug-namespace) | Debug tools | ✅ | ✅ |
| [`net_*`](/api-reference/json-rpc-api/core#net-namespace) | Network info | ✅ | ✅ |

<Info>
 Need an RPC endpoint? [Create](https://coinbase.com/developer-platform) a new CDP account or [sign in](https://portal.cdp.coinbase.com) to your existing account, then navigate to the [Node](https://portal.cdp.coinbase.com/products/node) page to get your free RPC endpoint and start building onchain!
</Info>

<Info>
 When constructing a JSON-RPC API request, use `base`or`base-sepolia`as the [network identifier](#network-identifiers).
</Info>

## Network identifiers

The following table shows the network identifiers necessary for constructing requests to various CDP APIs:

| Network | EVM Chain ID | HTTP API Identifier | JSON-RPC API Identifier |
| ---------------- | -------------------- | ------------------- | ----------------------- |
| Arbitrum Mainnet | **42161** (0xa4b1) |`arbitrum-mainnet`|`arbitrum`|
| Base Mainnet | **8453** (0x2105) |`base-mainnet`|`base`|
| Base Sepolia | **84532** (0x14a34) |`base-sepolia`|`base-sepolia`|
| Bitcoin Mainnet | - |`bitcoin-mainnet`|`bitcoin`|
| Ethereum Hoodi | **560048** (0x88bb0) |`ethereum-hoodi`| - |
| Ethereum Mainnet | **1** (0x1) |`ethereum-mainnet`|`ethereum`|
| Optimism Mainnet | **10** (0xa) |`optimism-mainnet`|`optimism`|
| Polygon Mainnet | **137** (0x89) |`polygon-mainnet`|`polygon`|
| Solana Devnet | - |`solana-devnet`| - |
| Solana Mainnet | - |`solana-mainnet`| - |

<Info>
 For CDP SDKs, find network identifiers in the corresponding SDK documentation
 (e.g,
 [NodeJS](https://coinbase.github.io/coinbase-sdk-nodejs/classes/coinbase_coinbase.Coinbase.html#networks)
 and
 [Python](https://coinbase.github.io/cdp-sdk-python/cdp.client.models.html#cdp.client.models.network_identifier.NetworkIdentifier)
</Info>

## What to read next

* [Supported Networks](/get-started/supported-networks): A more high-level overview of the CDP product suite and supported features.




## JSON-RPC API

# Core JSON-RPC Methods

> The following EVM-compatible JSON-RPC methods provide convenient access to onchain data on Base.

## Constructing Requests

**Option 1**: You can use the [JSON-RPC playground](https://portal.cdp.coinbase.com/products/node) to easily create sample JSON-RPC requests.

**Option 2**: Alternatively, you can construct your own requests by following the below steps:

1. Go to the [Node](https://portal.cdp.coinbase.com/products/node) page in the CDP Portal.
2. Ensure the correct network in your RPC URL (either`base`or`base-sepolia`).
3. Open a terminal and make your requests based on the supported methods in this API reference page.

<Info>
 **Authentication**

 For information on how to authenticate requests to our JSON-RPC APIs, please visit the **Client API Keys** section of our [Authentication page](/get-started/authentication/cdp-api-keys#client-api-keys).
</Info>

## Batch Requests

Below is an example of a [batch request](https://www.jsonrpc.org/specification#batch) for a JSON-RPC API method.

> Batch request example of `eth_getTransactionReceipt`#### Command```bash
curl -s {Your_Endpoint_URL} -H "Content-Type: application/json" -d '[{"jsonrpc": "2.0", "id": 1, "method": "eth_getTransactionReceipt", "params": ["0x633982a26e0cfba940613c52b31c664fe977e05171e35f62da2426596007e249"]}, { "jsonrpc": "2.0", "id": 2, "method": "eth_getTransactionReceipt", "params": ["0x3a7d521b20b5684e0e9ec14aeebe8ccab67137f7d5c2589efb55b0625fcc9c6d"]}]'
```## Ethereum Namespace

Below are example requests for JSON-RPC API methods in the`eth_*`namespace.

<Info>
 For API methods in the`eth_*`namespace, we only support the following block tags:`latest`, `earliest`, and block number in hex format.
</Info>

### `eth_blockNumber`The [API credit](/data/node/overview#rate-limits) value of this method is 30.
#### Command```bash
# eth_blockNumber: https://ethereum.org/en/developers/docs/apis/json-rpc#eth_blocknumber
curl -s {Your_Endpoint_URL} -H "Content-Type: application/json" -d '{"jsonrpc": "2.0", "id": 1, "method": "eth_blockNumber"}'
```###`eth_getBlockByNumber`The [API credit](/data/node/overview#rate-limits) value of this method is 30.
#### Command```bash
# eth_getBlockByNumber: https://ethereum.org/en/developers/docs/apis/json-rpc#eth_getblockbynumber
curl -s {Your_Endpoint_URL} -H "Content-Type: application/json" -d '{"jsonrpc": "2.0", "id": 1, "method": "eth_getBlockByNumber", "params": ["0xdad3c1", false]}'
```###`eth_getBlockByHash`The [API credit](/data/node/overview#rate-limits) value of this method is 30.
#### Command```bash
# eth_getBlockByHash: https://ethereum.org/en/developers/docs/apis/json-rpc#eth_getblockbyhash
curl -s {Your_Endpoint_URL} -H "Content-Type: application/json" -d '{"jsonrpc": "2.0", "id": 1, "method": "eth_getBlockByHash", "params": ["0x849a3ac8f0d81df1a645701cdb9f90e58500d2eabb80ff3b7f4e8c13f025eff2", false]}'
```###`eth_getBlockTransactionCountByHash`The [API credit](/data/node/overview#rate-limits) value of this method is 30.
#### Command```bash
# eth_getBlockTransactionCountByHash: https://ethereum.org/en/developers/docs/apis/json-rpc#eth_getblocktransactioncountbyhash
curl -s {Your_Endpoint_URL} -H "Content-Type: application/json" -d '{"jsonrpc": "2.0", "id": 1, "method": "eth_getBlockTransactionCountByHash", "params": ["0x849a3ac8f0d81df1a645701cdb9f90e58500d2eabb80ff3b7f4e8c13f025eff2"]}'
```###`eth_getBlockTransactionCountByNumber`The [API credit](/data/node/overview#rate-limits) value of this method is 30.
#### Command```bash
# eth_getBlockTransactionCountByNumber: https://ethereum.org/en/developers/docs/apis/json-rpc#eth_getblocktransactioncountbynumber
curl -s {Your_Endpoint_URL} -H "Content-Type: application/json" -d '{"jsonrpc": "2.0", "id": 1, "method": "eth_getBlockTransactionCountByNumber", "params": ["0xdad3c1"]}'
```###`eth_getTransactionByHash`The [API credit](/data/node/overview#rate-limits) value of this method is 30.
#### Command```bash
# eth_getTransactionByHash: https://ethereum.org/en/developers/docs/apis/json-rpc#eth_gettransactionbyhash
curl -s {Your_Endpoint_URL} -H "Content-Type: application/json" -d '{"jsonrpc": "2.0", "id": 1, "method": "eth_getTransactionByHash", "params": ["0x633982a26e0cfba940613c52b31c664fe977e05171e35f62da2426596007e249"]}'
```###`eth_getTransactionReceipt`The [API credit](/data/node/overview#rate-limits) value of this method is 30.
#### Command```bash
# eth_getTransactionReceipt: https://ethereum.org/en/developers/docs/apis/json-rpc#eth_gettransactionreceipt
curl -s {Your_Endpoint_URL} -H "Content-Type: application/json" -d '{"jsonrpc": "2.0", "id": 1, "method": "eth_getTransactionReceipt", "params": ["0x633982a26e0cfba940613c52b31c664fe977e05171e35f62da2426596007e249"]}'
```###`eth_getTransactionByBlockHashAndIndex`The [API credit](/data/node/overview#rate-limits) value of this method is 30.
#### Command```bash
# eth_getTransactionByBlockHashAndIndex: https://ethereum.org/en/developers/docs/apis/json-rpc#eth_gettransactionbyblockhashandindex
curl -s {Your_Endpoint_URL} -H "Content-Type: application/json" -d '{"jsonrpc": "2.0", "id": 1, "method": "eth_getTransactionByBlockHashAndIndex", "params": ["0x849a3ac8f0d81df1a645701cdb9f90e58500d2eabb80ff3b7f4e8c13f025eff2", "0x0"]}'
```###`eth_getTransactionByBlockNumberAndIndex`The [API credit](/data/node/overview#rate-limits) value of this method is 30.
#### Command```bash
# eth_getTransactionByBlockNumberAndIndex: https://ethereum.org/en/developers/docs/apis/json-rpc#eth_gettransactionbyblocknumberandindex
curl -s {Your_Endpoint_URL} -H "Content-Type: application/json" -d '{"jsonrpc": "2.0", "id": 1, "method": "eth_getTransactionByBlockNumberAndIndex", "params": ["0xdad3c1", "0x0"]}'
```###`eth_getLogs`The [API credit](/data/node/overview#rate-limits) value of this method is 100.
#### Command```bash
# eth_getLogs: https://ethereum.org/en/developers/docs/apis/json-rpc#eth_getlogs
curl -s {Your_Endpoint_URL} -H "Content-Type: application/json" -d '{"jsonrpc": "2.0", "id": 1, "method": "eth_getLogs", "params": [{"fromBlock": "0xdad3c1", "toBlock": "0xdad3c2"}]}'
```<Info>`eth_getLogs`has a max block range limit of`1000`blocks.
</Info>

###`eth_call`The [API credit](/data/node/overview#rate-limits) value of this method is 30.
#### Command```bash
# eth_call: https://ethereum.org/en/developers/docs/apis/json-rpc#eth_call
curl -s {Your_Endpoint_URL} -H "Content-Type: application/json" -d '{"jsonrpc": "2.0", "id": 1, "method": "eth_call", "params":[{ "to": "0x514910771af9ca656af840dff83e8264ecf986ca", "data": "0x70a08231000000000000000000000000f27eee60abacb983251fea941dd7350280a538ba"}, "latest"]}'
```###`eth_getBalance`#### Command```bash
# eth_getBalance: https://ethereum.org/en/developers/docs/apis/json-rpc#eth_getbalance
curl -s {Your_Endpoint_URL} -H "Content-Type: application/json" -d '{"jsonrpc": "2.0", "id": 1, "method": "eth_getBalance", "params":["0x8d97689c9818892b700e27f316cc3e41e17fbeb9", "latest"]}'
```###`eth_getCode`The [API credit](/data/node/overview#rate-limits) value of this method is 30.
#### Command```bash
# eth_getCode: https://ethereum.org/en/developers/docs/apis/json-rpc#eth_getcode
curl -s {Your_Endpoint_URL} -H "Content-Type: application/json" -d '{"jsonrpc": "2.0", "id": 1, "method": "eth_getCode", "params":["0x7f268357a8c2552623316e2562d90e642bb538e5", "latest"]}'
```###`eth_getTransactionCount`The [API credit](/data/node/overview#rate-limits) value of this method is 30.
#### Command```bash
# eth_getTransactionCount: https://ethereum.org/en/developers/docs/apis/json-rpc#eth_gettransactioncount
curl -s {Your_Endpoint_URL} -H "Content-Type: application/json" -d '{"jsonrpc": "2.0", "id": 1, "method": "eth_getTransactionCount", "params":["0xe222489ae12e15713cc1d65dd0ab2f5b18721bfd", "latest"]}'
```###`eth_chainId`The [API credit](/data/node/overview#rate-limits) value of this method is 30.
#### Command```bash
# eth_chainId: https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_chainid
curl -s {Your_Endpoint_URL} -H "Content-Type: application/json" -d '{"jsonrpc": "2.0", "id": 1, "method": "eth_chainId"}'
```###`eth_sendRawTransaction`The [API credit](/data/node/overview#rate-limits) value of this method is 30.
#### Command```bash
# eth_sendRawTransaction: https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_sendrawtransaction
curl -s {Your_Endpoint_URL} -H "Content-Type: application/json" -d '{"jsonrpc": "2.0", "id": 1, "method": "eth_sendRawTransaction", "params": ["0xf889808609184e72a00082271094000000000000000000000000000000000000000080a47f74657374320000000000000000000000000000000000000000000000000000006000571ca08a8bbf888cfa37bbf0bb965423625641fc956967b81d12e23709cead01446075a01ce999b56a8a88504be365442ea61239198e23d1fce7d00fcfc5cd3b44b7215f"]}'
```###`eth_gasPrice`The [API credit](/data/node/overview#rate-limits) value of this method is 30.
#### Command```bash
# eth_gasPrice: https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_gasprice
curl -s {Your_Endpoint_URL} -H "Content-Type: application/json" -d '{"jsonrpc": "2.0", "id": 1, "method": "eth_gasPrice"}'
```###`eth_getStorageAt`The [API credit](/data/node/overview#rate-limits) value of this method is 30.
#### Command```bash
# eth_getStorageAt: https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getstorageat
curl -s {Your_Endpoint_URL} -H "Content-Type: application/json" -d '{"jsonrpc": "2.0", "id": 1, "method": "eth_getStorageAt", "params": ["0x6c8f2a135f6ed072de4503bd7c4999a1a17f824b", "0x0", "latest"]}'
```###`eth_estimateGas`The [API credit](/data/node/overview#rate-limits) value of this method is 100.
#### Command```bash
# eth_estimateGas: https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_estimategas
curl -s {Your_Endpoint_URL} -H "Content-Type: application/json" -d '{"jsonrpc": "2.0", "id": 1, "method": "eth_estimateGas", "params": [{"from": "0x8d97689c9818892b700e27f316cc3e41e17fbeb9", "to": "0xd3cda913deb6f67967b99d67acdfa1712c293601", "value": "0x1"}]}'
```###`eth_protocolVersion`The [API credit](/data/node/overview#rate-limits) value of this method is 30.
#### Command```bash
# eth_protocolVersion: https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_protocolversion
curl -s {Your_Endpoint_URL} -H "Content-Type: application/json" -d '{"jsonrpc": "2.0", "id": 1, "method": "eth_protocolVersion"}'
```###`eth_syncing`The [API credit](/data/node/overview#rate-limits) value of this method is 30.
#### Command```bash
# eth_syncing: https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_syncing
curl -s {Your_Endpoint_URL} -H "Content-Type: application/json" -d '{"jsonrpc": "2.0", "id": 1, "method": "eth_syncing"}'
```###`eth_feeHistory`The [API credit](/data/node/overview#rate-limits) value of this method is 100.
#### Command```bash
curl -s {Your_Endpoint_URL} -H "Content-Type: application/json" -d '{"jsonrpc": "2.0", "id": 1, "method": "eth_feeHistory", "params": [4, "latest", [25, 75]]}'
```###`eth_mining`#### Command```bash
# eth_mining: https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_mining
curl -s {Your_Endpoint_URL} -H "Content-Type: application/json" -d '{"jsonrpc": "2.0", "id": 1, "method": "eth_mining"}'
```###`eth_hashrate`The [API credit](/data/node/overview#rate-limits) value of this method is 30.
#### Command```bash
# eth_hashrate: https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_hashrate
curl -s {Your_Endpoint_URL} -H "Content-Type: application/json" -d '{"jsonrpc": "2.0", "id": 1, "method": "eth_hashrate"}'
```###`eth_accounts`The [API credit](/data/node/overview#rate-limits) value of this method is 30.
#### Command```bash
# eth_accounts: https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_accounts
curl -s {Your_Endpoint_URL} -H "Content-Type: application/json" -d '{"jsonrpc": "2.0", "id": 1, "method": "eth_accounts"}'
```###`eth_newFilter`The [API credit](/data/node/overview#rate-limits) value of this method is 30.
#### Command```bash
# eth_newFilter: https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_newfilter
curl -s {Your_Endpoint_URL} -H "Content-Type: application/json" -d '{"jsonrpc": "2.0", "id": 1, "method": "eth_newFilter", "params":[{}]}'
```###`eth_newBlockFilter`The [API credit](/data/node/overview#rate-limits) value of this method is 30.
#### Command```bash
# eth_newBlockFilter: https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_newblockfilter
curl -s {Your_Endpoint_URL} -H "Content-Type: application/json" -d '{"jsonrpc": "2.0", "id": 1, "method": "eth_newBlockFilter"}'
```###`eth_uninstallFilter`The [API credit](/data/node/overview#rate-limits) value of this method is 30.
#### Command```bash
# eth_uninstallFilter: https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_uninstallfilter
curl -s {Your_Endpoint_URL} -H "Content-Type: application/json" -d '{"jsonrpc": "2.0", "id": 1, "method": "eth_uninstallFilter", "params":["0x81440f9af726125cb7fc671eb0f2d8728d6ad699989a"]}'
```###`eth_getFilterChanges`The [API credit](/data/node/overview#rate-limits) value of this method is 30.
#### Command```bash
# eth_getFilterChanges: https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getfilterchanges
curl -s {Your_Endpoint_URL} -H "Content-Type: application/json" -d '{"jsonrpc": "2.0", "id": 1, "method": "eth_getFilterChanges", "params":["0x81440f9af726125cb7fc671eb0f2d8728d6ad699989a"]}'
```###`eth_getFilterLogs`The [API credit](/data/node/overview#rate-limits) value of this method is 100.
#### Command```bash
# eth_getFilterLogs: https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getfilterlogs
curl -s {Your_Endpoint_URL} -H "Content-Type: application/json" -d '{"jsonrpc": "2.0", "id": 1, "method": "eth_getFilterLogs", "params":["0x81440f9af726125cb7fc671eb0f2d8728d6ad699989a"]}'
```###`eth_getFilteth_getWorkerLogs`The [API credit](/data/node/overview#rate-limits) value of this method is 30.
#### Command```bash
# eth_getFilteth_getWorkerLogs: https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getwork
curl -s {Your_Endpoint_URL} -H "Content-Type: application/json" -d '{"jsonrpc": "2.0", "id": 1, "method": "eth_getWork"}'
```###`eth_submitWork`The [API credit](/data/node/overview#rate-limits) value of this method is 30.
#### Command```bash
# eth_submitWork: https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_submitwork
curl -s {Your_Endpoint_URL} -H "Content-Type: application/json" -d '{"jsonrpc": "2.0", "id": 1, "method": "eth_submitWork", "params": ["0x0000000000000001", "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef", "0xD1FE5700000000000000000000000000D1FE5700000000000000000000000000"]}'
```###`eth_submitHashrate`The [API credit](/data/node/overview#rate-limits) value of this method is 30.
#### Command```bash
# eth_submitHashrate: https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_submithashrate
curl -s {Your_Endpoint_URL} -H "Content-Type: application/json" -d '{"jsonrpc": "2.0", "id": 1, "method": "eth_submitHashrate", "params":["0x500000", "0x59daa26581d0acd1fce254fb7e85952f4c09d0915afd33d3886cd914bc7d283c"]}'
```## Debug Namespace

Below are example requests for JSON-RPC API method in the`debug_*`namespace.

<Info>
 For API methods in the`debug_*`namespace, we only support the following tracer types:`callTracer`.
</Info>

### `debug_traceBlockByHash`The [API credit](/data/node/overview#rate-limits) value of this method is 500.
#### Command```bash
# debug_traceBlockByHash: https://geth.ethereum.org/docs/rpc/ns-debug#debug_traceblockbyhash
curl -s {Your_Endpoint_URL} -H "Content-Type: application/json" -d '{"jsonrpc": "2.0", "id": 1, "method": "debug_traceBlockByHash", "params": ["0xe075488f2716495e97c43f6eb2994964074a70245cca5844b308479ccbbb9ae7", {"tracer": "callTracer"}]}'
```###`debug_traceBlockByNumber`The [API credit](/data/node/overview#rate-limits) value of this method is 500.
#### Command```bash
# debug_traceBlockByNumber: https://geth.ethereum.org/docs/rpc/ns-debug#debug_traceblockbynumber
curl -s {Your_Endpoint_URL} -H "Content-Type: application/json" -d '{"jsonrpc": "2.0", "id": 1, "method": "debug_traceBlockByNumber", "params": ["0xe11130", {"tracer": "callTracer"}]}'
```###`debug_traceCall`The [API credit](/data/node/overview#rate-limits) value of this method is 500.
#### Command```bash
# debug_traceCall: https://geth.ethereum.org/docs/rpc/ns-debug#debug_traceCall
curl -s {Your_Endpoint_URL} -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","id":1,"method":"debug_traceCall","params":[{"from":"0x000000000000000000000000000000000000dead","to":"0x111111111111111111111111111111111111dead","gas":"0x30D40","gasPrice":"0x3B9ACA00","value":"0x0","data":"0xa9059cbb000000000000000000000000222222222222222222222222222222222222dead00000000000000000000000000000000000000000000000000000000000000ff"},"latest",{"tracer":"callTracer"}]}'
```## Net Namespace

Below are example requests for JSON-RPC API method in the`net_*`namespace.

###`net_version`The [API credit](/data/node/overview#rate-limits) value of this method is 30.
#### Command```bash
# net_version: https://ethereum.org/en/developers/docs/apis/json-rpc#net_version
curl -s {Your_Endpoint_URL} -H "Content-Type: application/json" -d '{"jsonrpc": "2.0", "id": 1, "method": "net_version"}'
```###`net_listening`The [API credit](/data/node/overview#rate-limits) value of this method is 30.
#### Command```bash
# net_listening: https://ethereum.org/en/developers/docs/apis/json-rpc/#net_listening
curl -s {Your_Endpoint_URL} -H "Content-Type: application/json" -d '{"jsonrpc": "2.0", "id": 1, "method": "net_listening"}'
```###`net_peercount`The [API credit](/data/node/overview#rate-limits) value of this method is 30.
#### Command```bash
# net_peercount: https://ethereum.org/en/developers/docs/apis/json-rpc/#net_peercount
curl -s {Your_Endpoint_URL} -H "Content-Type: application/json" -d '{"jsonrpc": "2.0", "id": 1, "method": "net_peerCount"}'
```## Web3 Namespace

Below are example requests for JSON-RPC API methods in the`web3_*`namespace.

###`web3_clientVersion`The [API credit](/data/node/overview#rate-limits) value of this method is 30.
#### Command```bash
# web3_clientVersion: https://ethereum.org/en/developers/docs/apis/json-rpc/#web3_clientversion
curl -s {Your_Endpoint_URL} -H "Content-Type: application/json" -d '{"jsonrpc": "2.0", "id": 1, "method": "web3_clientVersion"}'
```# Paymaster JSON-RPC Methods

## Constructing Requests

**Option 1**: You can use the JSON-RPC playground on the [Paymaster page](https://portal.cdp.coinbase.com/products/bundler-and-paymaster) to easily create sample JSON-RPC requests.

**Option 2**: Alternatively, you can construct your own requests by following the below steps:

1. Go to the JSON-RPC playground on the [Paymaster page](https://portal.cdp.coinbase.com/products/bundler-and-paymaster)
2. Ensure the correct network in your RPC URL (either`base`or`base-sepolia`).
3. Open a terminal and make your requests based on the supported methods in this API reference page.

<Info>
 **Authentication**

 For information on how to authenticate requests to our JSON-RPC APIs, please visit the **Client API Keys** section of our [Authentication page](/get-started/authentication/cdp-api-keys#client-api-keys).
</Info>

## Bundler Namespace

### `eth_supportedEntryPoints`This endpoint retrieves an array of supported entry points. Currently, the only supported entrypoint is v0.6`0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789`.

The [API credit](/data/node/overview#rate-limits) value of this method is 30.

#### Request/Response

<CodeGroup>
#### JSON
```json
 {
"id": 1,
"jsonrpc": "2.0",
"method": "eth_supportedEntryPoints"
 }
```#### JSON```json
 {
"jsonrpc": "2.0",
"id": 1,
"result": ["0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789"]
 }
```</CodeGroup>

###`eth_getUserOperationByHash`This endpoint returns a`UserOperation`based on the hash returned from [eth\_sendUserOperation](#eth_senduseroperation).

The [API credit](/data/node/overview#rate-limits) value of this method is 30.

#### Parameters

| Name | Type | Req | Description |
| :--- | :---- | :-: | :---------------------------------------- |
| hash | array | Y | The hash of the UserOperation to retrieve |

#### Returns

| Type | Description |
| :------------------- | :--------------------------------------------------------------------------------------------- |
| sender | Account initiating the UserOperation |
| nonce | Nonce |
| initCode | initCode (needed if the account needs to be created) |
| preVerificationGas | Amount of gas to pay for to compensate the bundler for pre-verification execution and calldata |
| maxFeePerGas | Maximum fee per gas to pay for the execution of this operation |
| maxPriorityFeePerGas | Maximum priority fee per gas |
| signature | Signature from the account |
| verificationGasLimit | Amount of gas to allocate for the verification step |
| callGasLimit | Amount of gas to allocate the main execution call |
| paymasterAndData | Hex string signed by the paymaster for a sponsored transaction |
| blockNumber | Block number in which UserOperation is included |
| blockHash | Block hash in which UserOperation is included |
| transactionHash | Transaction hash of the UserOperation |

#### Request/Response

<CodeGroup>
#### JSON```json
 {
"id": 1,
"jsonrpc": "2.0",
"method": "eth_getUserOperationByHash",
"params": [
 "0x77c0b560eb0b042902abc5613f768d2a6b2d67481247e9663bf4d68dec0ca122"
]
 }
```#### JSON```json
 {
"jsonrpc": "2.0",
 "id": 1,
"result": {
 sender, // string
 nonce, // string
 initCode, // string
 callData, // string
 callGasLimit, // string
 verificationGasLimit, // string
 preVerificationGas, // string
 maxFeePerGas, // string
 maxPriorityFeePerGas, // string
 signature, // string
 paymasterAndData, // string
blockNumber, // integer
blockHash, // string
transactionHash, // string
 }
 }
```</CodeGroup>

###`eth_getUserOperationReceipt`This endpoint returns a receipt based on the hash returned from [eth\_sendUserOperation](#eth_senduseroperation).

The [API credit](/data/node/overview#rate-limits) value of this method is 30.

#### Parameters

| Name | Type | Req | Description |
| :--- | :---- | :-: | :---------------------------------------- |
| hash | array | Y | The hash of the UserOperation to retrieve |

#### Returns

| Type | Description |
| :------------ | :--------------------------------------------------------------------------------------------------- |
| userOpHash | Hash of the UserOperation |
| entryPoint | Entrypoint that the UserOperation was sent to |
| sender | Account initiating the UserOperation |
| nonce | Nonce |
| paymaster | Paymaster used in the UserOperation |
| actualGasCost | Actual gas consumed by this UserOperation |
| actualGasUsed | Total gas used by this UserOperation |
| success | Whether the execution completed successfully |
| reason | If reverted, the reason the execution failed |
| logs | Logs generated by this UserOperation (not including logs of other UserOperations in the same bundle) |
| receipt | TransactionReceipt object for the entire bundle |

<CodeGroup>
#### JSON```json
 {
"id": 1,
"jsonrpc": "2.0",
"method": "eth_getUserOperationReceipt",
"params": [
 "0x77c0b560eb0b042902abc5613f768d2a6b2d67481247e9663bf4d68dec0ca122"
]
 }
```#### JSON```json
 {
"id": 1,
"jsonrpc": "2.0",
"result": {
 "userOpHash": "0x13574b2256b73bdc33fb121052f64b3803161e5ec602a6dc9e56177ba387e700",
 "entryPoint": "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
 "sender": "0x023fEF87894773DF227587d9B29af8D17b4dBB5A",
 "nonce": "0x1",
 "paymaster": null,
 "actualGasCost": "0x6f75ef8d",
 "actualGasUsed": "0x329af",
 "success": true,
 "reason": "",
 "logs": [
{
 "address": "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
 "topics": [
"0xbb47ee3e183a558b1a2ff0874b079f3fc5478b7454eacf2bfc5af2ff5878f972"
 ],
 "data": "0x",
 "blockNumber": "0x27fb22e",
 "transactionHash": "0x0f9b0e5868beaf345d8d55895c8037ae85adb91c422c00badcdcae8a0bf247a1",
 "transactionIndex": "0x4",
 "blockHash": "0x965e08190b1093c078bde81f67362203834784e34cf499d516f1a7b9c7a7b29e",
 "logIndex": "0x13",
 "removed": false
}
 ],
 "receipt": {
"blockHash": "0x965e08190b1093c078bde81f67362203834784e34cf499d516f1a7b9c7a7b29e",
"blockNumber": "0x27fb22e",
"from": "0x425d190ef5F561aFc8728593cA13EAf2FD9E3380",
"to": "0x25aD59adbe00C2d80c86d01e2E05e1294DA84823",
"cumulativeGasUsed": "0xe13e1",
"gasUsed": "0x329af",
"contractAddress": null,
"logs": [null],
"logsBloom": "0x000000010000000000000000800000000000000000000008000000000200000000080000020000020002080100010000001080000000000000100210000000000000000000000008000000000000808010000000000000000001000000000000000000000e000000000000000000080000002200000000408880000000000040000020000000000001000000080000002040000000040000000000000008000020000000000100000040000000000000000000000000000000000220000000400000000000000000000100000010000044000000800020000a100000010020000000000040000081000000000000000000000000000000400000000000100000",
"status": 1,
"type": "0x2",
"transactionHash": "0x0f9b0e5868beaf345d8d55895c8037ae85adb91c422c00badcdcae8a0bf247a1",
"transactionIndex": "0x4",
"effectiveGasPrice": "0x6f75ef8d"
 }
}
 }
```</CodeGroup>

###`eth_sendUserOperation`This endpoint sends a`UserOperation`for inclusion in the Bundler's private mempool. The signature must be a valid signature from the smart account.

The [API credit](/data/node/overview#rate-limits) value of this method is 500.

#### Parameters

| Name | Type | Req | Description |
| :------------ | :--------------------------------------------------------------------------------- | :-: | :----------------------------------------------------------------------------------------- |
| UserOperation | [UserOperation](https://www.erc4337.io/docs/understanding-ERC-4337/user-operation) | Y | The UserOperation. You may add a`paymasterAndData`field if the transaction is sponsored. |
| entryPoint | string | Y | EntryPoint address that the UserOperation is intended for. |

<CodeGroup>
#### JSON```json
 {
"jsonrpc": "2.0",
 "id": 1,
"method": "eth_sendUserOperation",
"params": [
 {
 sender, // address
 nonce, // uint256
 initCode, // string
 callData, // string
 callGasLimit, // string
 verificationGasLimit, // string
 preVerificationGas, // string
 maxFeePerGas, // string
 maxPriorityFeePerGas, // string
 signature, // string
 paymasterAndData, // string
 }, "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789"
]
 }
```#### JSON```json
 {
"jsonrpc": "2.0",
"id": 1,
"result": "0x1234...5678"
 }
```#### JSON```json
 {
"jsonrpc": "2.0",
"id": 1,
"error": {
 "message": "AA21 didn't pay prefund",
 "code": -32500
}
 }
```</CodeGroup>

###`eth_estimateUserOperationGas`This endpoint will estimate the gas values for a UserOperation. The signature field is ignored and can be a dummy value, but is recommended to be of the same size as an actual signature for an accurate estimate.

The [API credit](/data/node/overview#rate-limits) value of this method is 500.

#### Parameters

| Name | Type | Req | Description |
| :------------ | :--------------------------------------------------------------------------------- | :-: | :------------------------------------------------------------------------------------------------------------------------ |
| UserOperation | [UserOperation](https://www.erc4337.io/docs/understanding-ERC-4337/user-operation) | Y | The UserOperation. You can use a dummy signature but the signature must be the correct size for an accurate gas estimate. |
| entryPoint | string | Y | EntryPoint address that the UserOperation is intended for. |

#### Returns

| Type | Description |
| :------------------- | :---------------------------------------------------------------------------------- |
| preVerificationGas | Amount of gas to compensate the bundler for pre-verification execution and calldata |
| verificationGasLimit | Amount of gas to allocate for the verification step |
| callGasLimit | Amount of gas to allocate the main execution call |

<CodeGroup>
#### JSON```json
 {
"jsonrpc": "2.0",
 "id": 1,
"method": "eth_estimateUserOperationGas",
"params": [
 {
 sender, // address
 nonce, // uint256
 initCode, // string
 callData, // string
 callGasLimit, // string
 verificationGasLimit, // string
 preVerificationGas, // string
 maxFeePerGas, // string
 maxPriorityFeePerGas, // string
 signature, // string
 paymasterAndData, // string
 }, "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789"
]
 }
```#### JSON```json
 {
"jsonrpc": "2.0",
"id": 1,
"result": {
 "preVerificationGas": "0x...",
 "verificationGasLimit": "0x...",
 "callGasLimit": "0x..."
}
 }
```#### JSON```json
 {
"jsonrpc": "2.0",
"id": 1,
"error": {
 "message": "Error reason here.",
 "code": -32601
}
 }
```</CodeGroup>

## Paymaster Namespace

###`pm_getPaymasterStubData`> Note:
See the [ERC-7677 docs](https://www.erc7677.xyz/reference/paymasters/getPaymasterStubData) for parameters and returns.

The [API credit](/data/node/overview#rate-limits) value of this method is 30.

#### EntryPoint v0.6

<CodeGroup>
#### JSON```json
 {
"jsonrpc": "2.0",
"id": 1,
"method": "pm_getPaymasterStubData",
"params": [
 {
"sender": "0xd46e8dd67c5d32be8058bb8eb970870f07244567",
"nonce": "0x2a",
"initCode": "0x",
"callData": "0xd46e8dd67c5d32be8d46e8dd67c5d32be8058bb8eb970870f072445675058bb8eb970870f072445675",
"callGasLimit": "0x0",
"verificationGasLimit": "0x0",
"preVerificationGas": "0x0",
"maxFeePerGas": "0x0",
"maxPriorityFeePerGas": "0x0"
 },
 "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
 "0x14A34",
 {
"policyId": "631528b0-d444-4a9b-a575-40dd3aa4a13a"
 }
]
 }
```#### JSON```json
 {
"jsonrpc": "2.0",
"id": 1,
"result": {
 "paymasterAndData": "0xe3dc822D77f23984723871310CAAA32100000000000000000000000000000000000000000000000000000101010101010000000000000000000000000000000000000000000000000000000000000000cd91f19f0f19ce862d7bec7b7d9b95457145afc6f639c28fd0360f488937bfa41e6eedcd3a46054fd95fcd0e3ef6b0bc0a615c4d975eef55c8a3517257904d5b1c",
 "sponsor": {
"name": "My App",
"icon": "https://upload.wikimedia.org/wikipedia/en/c/cc/Wojak_cropped.jpg
 }
}
 }
```</CodeGroup>

###`pm_getPaymasterData`<Info>
 See the [ERC-7677 docs](https://www.erc7677.xyz/reference/paymasters/getPaymasterData) for parameters and returns.
</Info>

The [API credit](/data/node/overview#rate-limits) value of this method is 30.

#### EntryPoint v0.6

<CodeGroup>
#### JSON```json
 {
"jsonrpc": "2.0",
"id": 1,
"method": "pm_getPaymasterData",
"params": [
 {
"sender": "0xd46e8dd67c5d32be8058bb8eb970870f07244567",
"nonce": "0x2a",
"initCode": "0x",
"callData": "0xd46e8dd67c5d32be8d46e8dd67c5d32be8058bb8eb970870f072445675058bb8eb970870f072445675",
"callGasLimit": "0x0",
"verificationGasLimit": "0x0",
"preVerificationGas": "0x0",
"maxFeePerGas": "0x0",
"maxPriorityFeePerGas": "0x0"
 },
 "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
 "0x14A34",
 {
"policyId": "631528b0-d444-4a9b-a575-40dd3aa4a13a"
 }
]
 }
```#### JSON```json
 {
"jsonrpc": "2.0",
"id": 1,
"result": {
 "paymasterAndData": "0xe3dc822D77f23984723871310CAAA32100000000000000000000000000000000000000000000000000000101010101010000000000000000000000000000000000000000000000000000000000000000cd91f19f0f19ce862d7bec7b7d9b95457145afc6f639c28fd0360f488937bfa41e6eedcd3a46054fd95fcd0e3ef6b0bc0a615c4d975eef55c8a3517257904d5b1c"
}
 }
```</CodeGroup>

###`pm_sponsorUserOperation`The [API credit](/data/node/overview#rate-limits) value of this method is 500.

###`pm_getAcceptedPaymentTokens`The [API credit](/data/node/overview#rate-limits) value of this method is 30.

###`pm_getAddressSponsorshipInfo`The [API credit](/data/node/overview#rate-limits) value of this method is 30.



# Address History JSON-RPC Methods

> The following JSON-RPC APIs provide convenient access to historical data for your onchain addresses.

## Constructing Requests

**Option 1**: You can use the [JSON RPC playground](https://portal.cdp.coinbase.com/products/onchain-data) to easily create sample JSON RPC requests.

**Option 2**: Alternatively, you can construct your own requests by following the below steps:

1. Log into the [CDP Portal](https://portal.cdp.coinbase.com) and go to the [Data](https://portal.cdp.coinbase.com/products/onchain-data) page.
2. Ensure the correct network in your RPC URL based on the [supported RPC networks](/api-reference/networks#cdp-features).
3. Open a terminal and make your requests based on the supported methods in this API reference page.

<Info>
 **Authentication**

 For information on how to authenticate requests to our JSON-RPC APIs, please visit the **Client API Keys** section of our [Authentication page](/get-started/authentication/cdp-api-keys#client-api-keys).
</Info>

## JSON-RPC Methods for Address History Data

###`cdp_listBalances`This endpoint retrieves the latest balances for an address.
Note that this JSON RPC endpoint provides a more complete list of assets than the [CDP API](/api-reference/rest-api/addresses/list-address-balances).
However, there is a few seconds of delay in terms of data freshness for indexing a complete list of assets.
If you need more real-time data with whitelisted assets, you should use the [CDP API](/api-reference/rest-api/addresses/list-address-balances).

The [API credit](/data/node/overview#rate-limits) value of this method is 100.

#### Parameters

| Name | Type | Req | Description |
| :-------- | :----- | :-: | :-------------------------------------------------------------------------------------------------------------------------------------------------------- |
| address | string | Y | Blockchain address hash. EVM chain address hash should be lowercase. |
| pageSize | string | N | Number of balances to receive in a page. The default value is 25. The maximum value is 100, and values supplied over this will be coerced to the maximum. |
| pageToken | string | N | Provided from a previous response's nextPageToken |

#### Returns

| Field | Description |
| :--------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| asset.id | The identity of the asset for querying for details or history. |
| asset.type | The type of Asset the definition describes. For example: "native", "erc20", "erc721", "erc1155", "creditAlphanum4", "fa2". |
| asset.groupId | The contract address or group identifier for an Asset. For an NFT or a multi-token Asset this may identify a group of Asset. For a native Asset this will not be set. |
| asset.subGroupId | The identifier that distinguishes the identity of the Asset within the contract address or group. For an NFT or a multi-token Asset that can have many Assets associated with a contract address, this could be a token ID. For a UTXO, this could be the coin identifier. |
| value | The amount of the balance in the lowest denomination of the asset. Type is in BigInteger in standard base64 encoding. |
| valueStr | The string representation of the balance value to avoid precision loss. |
| decimals | The number of decimals the asset utilizes. |
| nextPageToken | A token which can be provided as`pageToken`to retrieve the next page. If this field is omitted, there are no additional pages. |
| | |

#### Request/Response

<CodeGroup>
#### JSON```json
 {
 "id": 1,
 "jsonrpc": "2.0",
 "method": "cdp_listBalances",
 "params": [
 {
 "address": "0x0e73fc61bb9d6b7588910c2d14e83bae68222c5d",
 "pageToken": "",
 "pageSize": 2
 }
 ]
 }
```#### JSON```json
 {
 "id": 1,
 "jsonrpc": "2.0",
 "result": {
 "balances": [
 {
 "asset": {
 "id": "08122fa4-510f-5ae4-9675-792c378b0018",
 "type": "erc20",
 "groupId": "0x6BE5830023b84f1C9B5BABB0Ca2B2a9DC5b9eD79",
 "subGroupId": ""
 },
 "value": 52333187000000000000000000,
 "valueStr": "52333187000000000000000000",
 "decimals": 18
 },
 {
 "asset": {
 "id": "1ddd4cf2-18ca-5c11-a7d5-d293330b19c7",
 "type": "erc20",
 "groupId": "0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA",
 "subGroupId": ""
 },
 "value": 1173345,
 "valueStr": "1173345",
 "decimals": 6
 }
 ],
 "nextPageToken": "Y2ZfUXRhTUpYeTZGZ......M2I3LTY5MmJiMmM1ZTEzNCJ9"
 }
 }
```</CodeGroup>

###`cdp_listBalanceDetails`This endpoint lists the latest balance details for an asset for an address.
Similar to`cdp_listBalances`, if you need more real-time data, you should use the [CDP API](/api-reference/rest-api/addresses/list-address-balances).

The [API credit](/data/node/overview#rate-limits) value of this method is 100.

#### Parameters

| Name | Type | Req | Description |
| :-------- | :----- | :-: | :-------------------------------------------------------------------------------------------------------------------------------------------------------- |
| address | string | Y | Blockchain address hash. EVM chain address hash should be lowercase. |
| assetId | string | Y | Provided from ListBalances or ListAddressTransactions response's asset field |
| pageSize | string | N | Number of balances to receive in a page. The default value is 25. The maximum value is 100, and values supplied over this will be coerced to the maximum. |
| pageToken | string | N | Provided from a previous response's nextPageToken |

#### Returns

| Field | Description |
| :--------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| asset.id | The identity of the asset for querying for details or history. |
| asset.type | The type of Asset the definition describes. For example: "native", "erc20", "erc721", "erc1155", "creditAlphanum4", "fa2". |
| asset.groupId | The contract address or group identifier for an Asset. For an NFT or a multi-token Asset this may identify a group of Asset. For a native Asset this will not be set. |
| asset.subGroupId | The identifier that distinguishes the identity of the Asset within the contract address or group. For an NFT or a multi-token Asset that can have many Assets associated with a contract address, this could be a token ID. For a UTXO, this could be the coin identifier. |
| value | The amount of the balance in the lowest denomination of the asset. Type is in BigInteger in standard base64 encoding. |
| valueStr | The string representation of the balance value to avoid precision loss. |
| decimals | The number of decimals the asset utilizes. |
| nextPageToken | A token which can be provided as `pageToken`to retrieve the next page. If this field is omitted, there are no additional pages. |

#### Request/Response

<CodeGroup>
#### JSON```json
 {
 "id": 1,
 "jsonrpc": "2.0",
 "method": "cdp_listBalanceDetails",
 "params": [
 {
 "address": "0x0e73fc61bb9d6b7588910c2d14e83bae68222c5d",
 "assetId": "08122fa4-510f-5ae4-9675-792c378b0018",
 "pageToken": "",
 "pageSize": 1
 }
 ]
 }
```#### JSON```json
 {
 "id": 1,
 "jsonrpc": "2.0",
 "result": {
 "balances": [
 {
 "asset": {
 "id": "08122fa4-510f-5ae4-9675-792c378b0018",
 "type": "erc20",
 "groupId": "0x6BE5830023b84f1C9B5BABB0Ca2B2a9DC5b9eD79",
 "subGroupId": ""
 },
 "value": 52333187000000000000000000,
 "valueStr": "52333187000000000000000000",
 "decimals": 18
 }
 ],
 "nextPageToken": ""
 }
 }
```</CodeGroup>

###`cdp_listBalanceHistories`This endpoint lists the balance histories for an asset for an address.`cdp_listBalanceHistory`is also a valid method name for this method.

The [API credit](/data/node/overview#rate-limits) value of this method is 100.

#### Parameters

| Name | Type | Req | Description |
| :-------- | :----- | :-: | :-------------------------------------------------------------------------------------------------------------------------------------------------------- |
| address | string | Y | Blockchain address hash. EVM chain address hash should be lowercase. |
| assetId | string | Y | Provided from ListBalances or ListAddressTransactions response's asset field |
| pageSize | string | N | Number of balances to receive in a page. The default value is 25. The maximum value is 100, and values supplied over this will be coerced to the maximum. |
| pageToken | string | N | Provided from a previous response's nextPageToken |

#### Returns

| Field | Description |
| :------------ | :------------------------------------------------------------------------------------------------------------------------------- |
| blockHash | The hash of the block this transaction was included in. |
| blockHeight | The height of the block this transaction was included in. |
| value | The amount of the balance in the lowest denomination of the asset. Type is in BigInteger in standard base64 encoding. |
| valueStr | The string representation of the balance value to avoid precision loss. |
| nextPageToken | A token which can be provided as`pageToken`to retrieve the next page. If this field is omitted, there are no additional pages. |

#### Request/Response

<CodeGroup>
#### JSON```json
 {
 "id": 1,
 "jsonrpc": "2.0",
 "method": "cdp_listBalanceHistories",
 "params": [
 {
 "address": "0x0e73fc61bb9d6b7588910c2d14e83bae68222c5d",
 "assetId": "123d82ca-b3f4-527c-ace7-559d5791a564",
 "pageToken": "",
 "pageSize": 2
 }
 ]
 }
```#### JSON```json
 {
 "id": 1,
 "jsonrpc": "2.0",
 "result": {
 "balanceHistories": [
 {
 "blockHeight": 2767233,
 "blockHash": "0x980773f020fea...70ee1a2f349241df338",
 "value": 4999990000000000000000,
 "valueStr": "4999990000000000000000"
 }
 ],
 "nextPageToken": ""
 }
 }
```</CodeGroup>

###`cdp_listAddressTransactions`This endpoint lists the transactions for an address.`cdp_listTransactions`is also a valid method name for this method.

The [API credit](/data/node/overview#rate-limits) value of this method is 100.

#### Parameters

| Name | Type | Req | Description |
| :-------- | :----- | :-: | :-------------------------------------------------------------------------------------------------------------------------------------------------------- |
| address | string | Y | Blockchain address hash. EVM chain address hash should be lowercase. |
| pageSize | string | N | Number of balances to receive in a page. The default value is 25. The maximum value is 100, and values supplied over this will be coerced to the maximum. |
| pageToken | string | N | Provided from a previous response's nextPageToken |

#### Returns

| Field | Description |
| :---------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| name | A unique identifier for the transaction, which cannot be changed once created.In the format of`networks/{network}/indexers/{indexer}/transactions/{transaction}`|
| hash | The transaction hash |
| blockHash | The hash of the block this transaction was included in. |
| blockHeight | The height of the block this transaction was included in. |
| status | The status of the transaction |
| content | The transaction content in either ethereum or rosetta format. |

#### Request/Response

<CodeGroup>
#### JSON```json
 {
 "id": 1,
 "jsonrpc": "2.0",
 "method": "cdp_listAddressTransactions",
 "params": [
 {
 "address": "0x0e73fc61bb9d6b7588910c2d14e83bae68222c5d",
 "pageToken": "",
 "pageSize": 2
 }
 ]
 }
```#### JSON```json
 {
 "id": 1,
 "jsonrpc": "2.0",
 "result": {
 "addressTransactions": [
 {
 "name": "networks/polygon-mainnet/indexers/default/transactions/0x8e9a4e099a8453e71b31b6c2c23b25926aadedf096bfb39071f1c84be0a8a06b",
 "hash": "0x8e9a4e099...9071f1c84be0a8a06b",
 "blockHash": "0xa6a7435ad5cc...13405fd38f5d85f",
 "blockHeight": "56393424",
 "status": "CONFIRMED",
 "ethereum": {
 "blockHash": "0xa6a7435ad5cc...13405fd38f5d85f",
 "blockNumber": "56393424",
 "from": "0xa83bd46d2757800bc8314a2cc14714c4afe272b5",
 "gas": "105257",
 "gasPrice": "125953591812",
 "hash": "0x8e9a4e099a8...1f1c84be0a8a06b",
 "input": "0xef6c59...000000000",
 "nonce": "119022",
 "to": "0xf6d1b85af155229acd7b523601148585a1ff67c6",
 "index": "8",
 "value": "0",
 "receipt": {
 "transactionHash": "0x8e9a4e09...f1c84be0a8a06b",
 "transactionIndex": "8",
 "blockHash": "0xa6a7435ad5c...9713405fd38f5d85f",
 "blockNumber": "56393424",
 "from": "0xa83bd46d2757800bc8314a2cc14714c4afe272b5",
 "to": "0xf6d1b85af155229acd7b523601148585a1ff67c6",
 "cumulativeGasUsed": "893833",
 "gasUsed": "105257",
 "contractAddress": "",
 "logs": [
 {
 "removed": false,
 "logIndex": "27",
 "transactionHash": "0x8e9a4e09...c84be0a8a06b",
 "transactionIndex": "8",
 "blockHash": "0xa6a743...3405fd38f5d85f",
 "blockNumber": "56393424",
 "address": "0x5d666f2...7ecd2c8cc44e6",
 "data": "0x",
 "topics": [
 "0xddf252ad1be2c...4a11628f55a4df523b3ef",
 "0x00000000000000...00000000000000",
 "0x0000000000...2d14e83bae68222c5d",
 "0x00000000000...0000000000020c669e"
 ]
 }
 ],
 "logsBloom": "0x0000000000...00000100000",
 "root": "",
 "status": "1",
 "type": "0",
 "effectiveGasPrice": "125953591812"
 },
 "tokenTransfers": [
 {
 "tokenAddress": "0x5d666f...ecd2c8cc44e6",
 "fromAddress": "0x000000000...00000000",
 "toAddress": "0x0e73fc6...bae68222c5d",
 "value": "",
 "transactionIndex": "8",
 "transactionHash": "0x8e9a4e0..e0a8a06b",
 "logIndex": "27",
 "blockHash": "0xa6a7435ad5..9713405fd38f5d85f",
 "blockNumber": "56393424",
 "erc721": {
 "fromAddress": "0x000000000..0000",
 "toAddress": "0x0e73fc61b..e68222c5d",
 "tokenId": "34367134"
 }
 }
 ],
 "type": "0",
 "priorityFeePerGas": "82907832252",
 "flattenedTraces": [
 {
 "error": "",
 "type": "CALL",
 "from": "0xa83bd46d2...fe272b5",
 "to": "0xf6d1b85af155229acd7b523601148585a1ff67c6",
 "value": "0",
 "gas": "105257",
 "gasUsed": "105257",
 "input": "0xef6c599600...000000000000",
 "output": "",
 "subtraces": "2",
 "traceAddress": [],
 "traceType": "CALL",
 "callType": "CALL",
 "traceId": "CALL_0x8e9a4e099a...1c84be0a8a06b",
 "status": "1",
 "blockHash": "0xa6a7435ad5...713405fd38f5d85f",
 "blockNumber": "56393424",
 "transactionHash": "0x8e9a4e099a...f1c84be0a8a06b",
 "transactionIndex": "8"
 }
 ],
 "blockTimestamp": "2024-04-29T18:08:30Z"
 }
 }
 ],
 "nextPageToken": "RlZ6VFBwc2lDSVd...IzEiLCJpZHgiOjB9"
 }
 }
```
</CodeGroup>




## SDKs

# Introduction

> Explore our SDKs for building onchain apps, AI agents, and more.

export const Section = ({children}) => {
 return <div className="not-prose text-sm text-primary dark:text-primary-light mt-2 mb-1 font-bold">
 {children}
 </div>;
};


export const Title = ({children, lightImg, darkImg, hasTopMargin}) => {
 return <div className={`flex gap-2 not-prose ${hasTopMargin ? "mt-12" : ""}`}>
 <img src={lightImg} style={{
 width: "28px",
 height: "28px"
 }} noZoom className="block dark:hidden" />
 <img src={darkImg} style={{
 width: "28px",
 height: "28px"
 }} noZoom className="hidden dark:block" />
 <span className="font-semibold text-xl">{children}</span>
 </div>;
};


## <Section>Build onchain</Section>

<Title
 lightImg={
 "https://static-assets.coinbase.com/ui-infra/illustration/v1/pictogram/svg/light/developerSDKNavigation-0.svg
}
 darkImg={
 "https://static-assets.coinbase.com/ui-infra/illustration/v1/pictogram/svg/dark/developerSDKNavigation-0.svg
}
>
 ### CDP SDK v2
</Title>

Backend onchain tools for interacting with EVM and Solana APIs to create accounts and send transactions, policy APIs to govern transaction permissions, as well as authentication tools for interacting directly with the CDP APIs.


 
- [Python](https://coinbase.github.io/cdp-sdk/python/)


 
- [TypeScript](/sdks/cdp-sdks-v2/typescript)



Front end tools for providing embedded wallets and other onchain primitives to end users.


 
- [Frontend](/sdks/cdp-sdks-v2/frontend)



<Title lightImg="https://static-assets.coinbase.com/ui-infra/illustration/v1/pictogram/svg/light/layerNetworks-3.svg darkImg="https://static-assets.coinbase.com/ui-infra/illustration/v1/pictogram/svg/dark/layerNetworks-3.svg hasTopMargin>
 ### CDP SDK v1
</Title>

Backend onchain tools to enable the simple integration of crypto into your app. By calling Coinbase's Platform APIs, the SDK allows you to provision crypto wallets, send crypto into/out of those wallets, track wallet balances, and trade crypto from one asset into another.


 
- [Python](https://coinbase.github.io/cdp-sdk-python/index.html)


 
- [TypeScript](https://coinbase.github.io/coinbase-sdk-nodejs/index.html)



<Title lightImg="https://static-assets.coinbase.com/ui-infra/illustration/v1/pictogram/svg/light/nftAvatar-3.svg darkImg="https://static-assets.coinbase.com/ui-infra/illustration/v1/pictogram/svg/dark/nftAvatar-3.svg hasTopMargin>
 ### AgentKit
</Title>

AgentKit is a toolkit enabling AI agents to interact with blockchain networks with secure wallet management and comprehensive onchain capabilities. Built on the Coinbase Developer Platform (CDP) SDK, it provides everything needed to create autonomous agents that can perform sophisticated blockchain operations.


 
- [Python](https://github.com/coinbase/agentkit/blob/main/python/coinbase-agentkit/README.md)


 
- [TypeScript](https://github.com/coinbase/agentkit/blob/main/typescript/agentkit/README.md)



<Title lightImg="https://static-assets.coinbase.com/ui-infra/illustration/v1/pictogram/svg/light/easyToUse-2.svg darkImg="https://static-assets.coinbase.com/ui-infra/illustration/v1/pictogram/svg/dark/easyToUse-2.svg hasTopMargin>
 ### OnchainKit
</Title>

OnchainKit is your go-to SDK for building beautiful onchain applications. Ship in minutes, not weeks. Anyone can build an onchain app in 15 minutes with OnchainKit. No blockchain experience required.


- [React & TypeScript](https://docs.base.org/builderkits/onchainkit/getting-started)


<Title lightImg="https://static-assets.coinbase.com/ui-infra/illustration/v1/pictogram/svg/light/findYourSelection-2.svg darkImg="https://static-assets.coinbase.com/ui-infra/illustration/v1/pictogram/svg/dark/findYourSelection-2.svg hasTopMargin>
 ### MiniKit
</Title>

MiniKit is easiest way to build Mini Apps on Base, allowing developers to easily build applications without needing to know the details of the SDK implementation. It integrates seamlessly with OnchainKit components and provides Coinbase Wallet-specific hooks.


- [React & TypeScript](https://docs.base.org/builderkits/minikit/overview)


## <Section>Consumer APIs</Section>

<Title lightImg="https://static-assets.coinbase.com/ui-infra/illustration/v1/pictogram/svg/light/coinbaseOneTrade-0.svg darkImg="https://static-assets.coinbase.com/ui-infra/illustration/v1/pictogram/svg/dark/coinbaseOneTrade-0.svg>
 ### Coinbase Advanced Trade
</Title>

Coinbase Advanced Trade is our advanced trading platform, intended for the more experienced trader. It offers a secure and easy way to buy, sell, and trade digital assets online across various trading pairs.


 
- [Python](https://github.com/coinbase/coinbase-advanced-py/)


 
- [TypeScript](https://github.com/coinbase-samples/advanced-sdk-ts)


 
- [Go](https://github.com/coinbase-samples/advanced-trade-sdk-go)


 
- [Java](https://github.com/coinbase-samples/advanced-sdk-java)



## <Section>Institutional APIs</Section>

<Title lightImg="https://static-assets.coinbase.com/ui-infra/illustration/v1/spotIcon/svg/light/primeProduct-1.svg darkImg="https://static-assets.coinbase.com/ui-infra/illustration/v1/spotIcon/svg/dark/primeProduct-1.svg>
 ### Coinbase Prime
</Title>

Coinbase Prime is a full-service prime brokerage platform for institutional investors, combining secure custody solutions, advanced trading options via our Smart Order Router, and real-time market data to meet the needs of professional traders and financial institutions.


 
- [Java](https://github.com/coinbase-samples/prime-sdk-java)


 
- [.Net](https://github.com/coinbase-samples/prime-sdk-dotnet)


 
- [Go](https://github.com/coinbase-samples/prime-sdk-go)


 
- [Python](https://github.com/coinbase-samples/prime-sdk-py)


 
- [TypeScript](https://github.com/coinbase-samples/prime-sdk-ts)








## BUILD ONCHAIN

## CDP SDKs V2

## Backend

TypeScript:

# Overview

The TypeScript CDP SDK is a library that provides a client for interacting with the [Coinbase Developer Platform (CDP)](https://docs.cdp.coinbase.com/ It includes a CDP Client for interacting with EVM and Solana APIs to create accounts and send transactions, policy APIs to govern transaction permissions, as well as authentication tools for interacting directly with the CDP APIs.

Further documentation is also available on the CDP docs website:

* [Wallet API v2](https://docs.cdp.coinbase.com/wallet-api-v2/docs/welcome)
* [API Reference](https://docs.cdp.coinbase.com/api-v2/docs/welcome)

## Installation
#### Command
```bash
npm install @coinbase/cdp-sdk
```## API Keys

To start, [create a CDP API Key](https://portal.cdp.coinbase.com/access/api Save the`API Key ID`and`API Key Secret`for use in the SDK. You will also need to create a wallet secret in the Portal to sign transactions.

## Usage

### Initialization

#### Load client config from shell

One option is to export your CDP API Key and Wallet Secret as environment variables:
#### Command```bash
export CDP_API_KEY_ID="YOUR_API_KEY_ID"
export CDP_API_KEY_SECRET="YOUR_API_KEY_SECRET"
export CDP_WALLET_SECRET="YOUR_WALLET_SECRET"
```Then, initialize the client:
#### Code```typescript
import { CdpClient } from "@coinbase/cdp-sdk";

const cdp = new CdpClient;
```#### Load client config from`.env`file

Another option is to save your CDP API Key and Wallet Secret in a`.env`file:
#### Command```bash
touch .env
echo "CDP_API_KEY_ID=YOUR_API_KEY_ID" >> .env
echo "CDP_API_KEY_SECRET=YOUR_API_KEY_SECRET" >> .env
echo "CDP_WALLET_SECRET=YOUR_WALLET_SECRET" >> .env
```Then, load the client config from the`.env`file:
#### Code```typescript
import { CdpClient } from "@coinbase/cdp-sdk";
import dotenv from "dotenv";

dotenv.config;

const cdp = new CdpClient;
```#### Pass the API Key and Wallet Secret to the client

Another option is to directly pass the API Key and Wallet Secret to the client:
#### Code```typescript
const cdp = new CdpClient({
 apiKeyId: "YOUR_API_KEY_ID",
 apiKeySecret: "YOUR_API_KEY_SECRET",
 walletSecret: "YOUR_WALLET_SECRET",
});
```### Creating EVM or Solana accounts

#### Create an EVM account as follows:
#### Code```typescript
const account = await cdp.evm.createAccount;
```#### Import an EVM account as follows:
#### Code```typescript
const account = await cdp.evm.importAccount({
 privateKey: "0x123456",
 name: "MyAccount",
});
```#### Create a Solana account as follows:
#### Code```typescript
const account = await cdp.solana.createAccount;
```#### Import a Solana account as follows:
#### Code```typescript
const account = await cdp.solana.importAccount({
 privateKey: "3MLZ...Uko8zz",
 name: "MyAccount",
});
```### Exporting EVM or Solana accounts

#### Export an EVM account as follows:
#### Code```typescript
// by name
const privateKey = await cdp.evm.exportAccount({
 name: "MyAccount",
});

// by address
const privateKey = await cdp.evm.exportAccount({
 address: "0x123",
});
```#### Export a Solana account as follows:
#### Code```typescript
// by name
const privateKey = await cdp.solana.exportAccount({
 name: "MyAccount",
});

// by address
const privateKey = await cdp.solana.exportAccount({
 address: "Abc",
});
```#### Get or Create an EVM account as follows:
#### Code```typescript
const account = await cdp.evm.getOrCreateAccount({
 name: "Account1",
});
```#### Get or Create a Solana account as follows:
#### Code```typescript
const account = await cdp.solana.getOrCreateAccount({
 name: "Account1",
});
```#### Get or Create a Smart Account as follows:
#### Code```typescript
const owner = await cdp.evm.createAccount;
const account = await cdp.evm.getOrCreateSmartAccount({
 name: "Account1",
 owner
});
```### Creating EVM or Solana accounts with policies

#### Create an EVM account with policy as follows:
#### Code```typescript
const account = await cdp.evm.createAccount({
 name: "AccountWithPolicy",
 accountPolicy: "abcdef12-3456-7890-1234-567890123456"
})
```#### Create a Solana account with policy as follows:
#### Code```typescript
const account = await cdp.solana.createAccount({
 name: "AccountWithPolicy",
 accountPolicy: "abcdef12-3456-7890-1234-567890123456"
})
```### Updating EVM or Solana accounts

#### Update an EVM account as follows:
#### Code```typescript
const account = await cdp.evm.updateAccount({
 addresss: account.address,
 update: {
name: "Updated name",
accountPolicy: "1622d4b7-9d60-44a2-9a6a-e9bbb167e412",
 },
});
```#### Update a Solana account as follows:
#### Code```typescript
const account = await cdp.solana.updateAccount({
 addresss: account.address,
 update: {
name: "Updated name",
accountPolicy: "1622d4b7-9d60-44a2-9a6a-e9bbb167e412",
 },
});
```### Testnet faucet

You can use the faucet function to request testnet ETH or SOL from the CDP.

#### Request testnet ETH as follows:
#### Code```typescript
const faucetResp = await cdp.evm.requestFaucet({
 address: evmAccount.address,
 network: "base-sepolia",
 token: "eth",
});
```#### Request testnet SOL as follows:
#### Code```typescript
const faucetResp = await cdp.solana.requestFaucet({
 address: fromAddress,
 token: "sol",
});
```### Sending transactions

#### EVM

You can use CDP SDK to send transactions on EVM networks.
#### Code```typescript
import { CdpClient } from "@coinbase/cdp-sdk";
import { parseEther, createPublicClient, http } from "viem";
import { baseSepolia } from "viem/chains";

const publicClient = createPublicClient({
 chain: baseSepolia,
 transport: http,
});

const cdp = new CdpClient;

const account = await cdp.evm.createAccount;

const faucetResp = await cdp.evm.requestFaucet({
 address: account.address,
 network: "base-sepolia",
 token: "eth",
});

const faucetTxReceipt = await publicClient.waitForTransactionReceipt({
 hash: faucetResp.transactionHash,
});

const { transactionHash } = await cdp.evm.sendTransaction({
 address: account.address,
 network: "base-sepolia",
 transaction: {
to: "0x4252e0c9A3da5A2700e7d91cb50aEf522D0C6Fe8",
value: parseEther("0.000001"),
 },
});

await publicClient.waitForTransactionReceipt({ hash: transactionHash });

console.log(
 `Transaction confirmed! Explorer link: https://sepolia.basescan.org/tx/${transactionHash}`);```CDP SDK is fully viem-compatible, so you can optionally use a`walletClient`to send transactions.
#### Code```typescript
import { CdpClient } from "@coinbase/cdp-sdk";
import { parseEther, createPublicClient, http, createWalletClient, toAccount } from "viem";
import { baseSepolia } from "viem/chains";

const publicClient = createPublicClient({
 chain: baseSepolia,
 transport: http,
});

const cdp = new CdpClient;

const account = await cdp.evm.createAccount;

const faucetResp = await cdp.evm.requestFaucet({
 address: account.address,
 network: "base-sepolia",
 token: "eth",
});

const faucetTxReceipt = await publicClient.waitForTransactionReceipt({
 hash: faucetResp.transactionHash,
});

const walletClient = createWalletClient({
 account: toAccount(serverAccount),
 chain: baseSepolia,
 transport: http,
});

// Step 3: Sign the transaction with CDP and broadcast it using the wallet client.
const hash = await walletClient.sendTransaction({
 to: "0x4252e0c9A3da5A2700e7d91cb50aEf522D0C6Fe8",
 value: parseEther("0.000001"),
});

console.log(`Transaction confirmed! Explorer link: https://sepolia.basescan.org/tx/${hash}`;
```#### Solana

You can use CDP SDK to send transactions on Solana.

For complete examples, check out [sendTransaction.ts](https://github.com/coinbase/cdp-sdk/blob/main/examples/typescript/solana/transactions/sendTransaction.ts [sendManyTransactions.ts](https://github.com/coinbase/cdp-sdk/blob/main/examples/typescript/solana/transactions/sendManyTransactions.ts and [sendManyBatchedTransactions.ts](https://github.com/coinbase/cdp-sdk/blob/main/examples/typescript/solana/transactions/sendManyBatchedTransactions.ts)
#### Code```typescript
import { CdpClient } from "@coinbase/cdp-sdk";
import "dotenv/config";

import {
 PublicKey,
 SystemProgram,
 SYSVAR_RECENT_BLOCKHASHES_PUBKEY,
 Transaction,
} from "@solana/web3.js";

const cdp = new CdpClient;

const account = await cdp.solana.createAccount;

const faucetResp = await cdp.solana.requestFaucet({
 address: account.address,
 token: "sol",
});

const transaction = new Transaction;
transaction.add(
 SystemProgram.transfer({
fromPubkey: new PublicKey(account.address),
toPubkey: new PublicKey("3KzDtddx4i53FBkvCzuDmRbaMozTZoJBb1TToWhz3JfE"),
lamports: 10000,
 })
);

// A more recent blockhash is set in the backend by CDP
transaction.recentBlockhash = SYSVAR_RECENT_BLOCKHASHES_PUBKEY.toBase58;
transaction.feePayer = new PublicKey(account.address);

const serializedTx = Buffer.from(
 transaction.serialize({ requireAllSignatures: false })
).toString("base64");

console.log("Transaction serialized successfully");

const txResult = await cdp.solana.sendTransaction({
 network: "solana-devnet",
 transaction: serializedTx,
});

console.log(
 `Transaction confirmed! Explorer link: https://explorer.solana.com/tx/${txResult.signature}?cluster=devnet`);```### EVM Smart Accounts

For EVM, we support Smart Accounts which are account-abstraction (ERC-4337) accounts. Currently there is only support for Base Sepolia and Base Mainnet for Smart Accounts.

#### Create an EVM account and a smart account as follows:
#### Code```typescript
const evmAccount = await cdp.evm.createAccount;
const smartAccount = await cdp.evm.createSmartAccount({
 owner: evmAccount,
});
```#### Sending User Operations
#### Code```typescript
const userOperation = await cdp.evm.sendUserOperation({
 smartAccount: smartAccount,
 network: "base-sepolia",
 calls: [
{
 to: "0x0000000000000000000000000000000000000000",
 value: parseEther("0.000001"),
 data: "0x",
},
 ],
});
```#### In Base Sepolia, all user operations are gasless by default. If you'd like to specify a different paymaster, you can do so as follows:
#### Code```typescript
const userOperation = await cdp.sendUserOperation({
 smartAccount: smartAccount,
 network: "base-sepolia",
 calls: [
{
 to: "0x0000000000000000000000000000000000000000",
 value: parseEther("0"),
 data: "0x",
},
 ],
 paymasterUrl: "https://some-paymaster-url.com
});
```### EVM Swaps

You can use the CDP SDK to swap tokens on EVM networks using both regular accounts (EOAs) and smart accounts.

The SDK provides three approaches for performing token swaps:

#### 1. All-in-one pattern (Recommended)

The simplest approach for performing swaps. Creates and executes the swap in a single line of code:

**Regular Account (EOA):**
#### Code```typescript
// Retrieve an existing EVM account with funds already in it
const account = await cdp.evm.getOrCreateAccount({ name: "MyExistingFundedAccount" });

// Execute a swap directly on an EVM account in one line
const { transactionHash } = await account.swap({
 network: "base",
 toToken: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC on Base
 fromToken: "0x4200000000000000000000000000000000000006", // WETH on Base
 fromAmount: BigInt("1000000000000000000"), // 1 WETH in wei
 slippageBps: 100, // 1% slippage tolerance
});

console.log(`Swap executed: ${transactionHash}`);
```**Smart Account:**
#### Code```typescript
// Create or retrieve a smart account with funds already in it
const owner = await cdp.evm.getOrCreateAccount({ name: "MyOwnerAccount" });
const smartAccount = await cdp.evm.getOrCreateSmartAccount({ name: "MyExistingFundedSmartAccount", owner });

// Execute a swap directly on a smart account in one line
const { userOpHash } = await smartAccount.swap({
 network: "base",
 toToken: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC on Base
 fromToken: "0x4200000000000000000000000000000000000006", // WETH on Base
 fromAmount: BigInt("1000000000000000000"), // 1 WETH in wei
 slippageBps: 100, // 1% slippage tolerance
 // Optional: paymasterUrl: "https://paymaster.example.com // For gas sponsorship
});

console.log(`Smart account swap executed: ${userOpHash}`);

// Wait for the user operation to complete
const receipt = await smartAccount.waitForUserOperation({ userOpHash });
console.log(`Status: ${receipt.status}`);
```#### 2. Get pricing information

Use`getSwapPrice`for quick price estimates and display purposes. This is ideal for showing exchange rates without committing to a swap:
#### Code```typescript
const swapPrice = await cdp.evm.getSwapPrice({
 network: "ethereum",
 toToken: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
 fromToken: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH
 fromAmount: BigInt("1000000000000000000"), // 1 WETH in wei
 taker: "0x1234567890123456789012345678901234567890"
});

if (swapPrice.liquidityAvailable) {
 console.log(`You'll receive: ${swapPrice.toAmount} USDC`);
 console.log(`Minimum after slippage: ${swapPrice.minToAmount} USDC`);
}
```**Note:**`getSwapPrice`does not reserve funds or signal commitment to swap, making it suitable for more frequent price updates with less strict rate limiting - although the data may be slightly less precise.

#### 3. Create and execute separately

Use`account.quoteSwap`/`smartAccount.quoteSwap`when you need full control over the swap process. This returns complete transaction data for execution:

**Important:**`quoteSwap`signals a soft commitment to swap and may reserve funds on-chain. It is rate-limited more strictly than`getSwapPrice`to prevent abuse.

**Regular Account (EOA):**
#### Code```typescript
// Retrieve an existing EVM account with funds already in it
const account = await cdp.evm.getOrCreateAccount({ name: "MyExistingFundedAccount" });

// Step 1: Create a swap quote with full transaction details
const swapQuote = await account.quoteSwap({
 network: "base",
 toToken: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC
 fromToken: "0x4200000000000000000000000000000000000006", // WETH
 fromAmount: BigInt("1000000000000000000"), // 1 WETH in wei
 slippageBps: 100, // 1% slippage tolerance
});

// Step 2: Check if liquidity is available, and/or perform other analysis on the swap quote
if (!swapQuote.liquidityAvailable) {
 console.error("Insufficient liquidity for swap");
 return;
}

// Step 3: Execute using the quote
const { transactionHash } = await swapQuote.execute;
```**Smart Account:**
#### Code```typescript
// Create or retrieve a smart account with funds already in it
const owner = await cdp.evm.getOrCreateAccount({ name: "MyOwnerAccount" });
const smartAccount = await cdp.evm.getOrCreateSmartAccount({ name: "MyExistingFundedSmartAccount", owner });

// Step 1: Create a swap quote with full transaction details for smart account
const swapQuote = await smartAccount.quoteSwap({
 network: "base",
 toToken: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC
 fromToken: "0x4200000000000000000000000000000000000006", // WETH
 fromAmount: BigInt("1000000000000000000"), // 1 WETH in wei
 slippageBps: 100, // 1% slippage tolerance
});

// Step 2: Check if liquidity is available, and/or perform other analysis on the swap quote
if (!swapQuote.liquidityAvailable) {
 console.error("Insufficient liquidity for swap");
 return;
}

// Step 3: Execute using the quote
const { userOpHash } = await swapQuote.execute;

// Wait for the user operation to complete
const receipt = await smartAccount.waitForUserOperation({ userOpHash });
console.log(`Status: ${receipt.status}`);
```
#### When to use each approach:

* **All-in-one (`account.swap`/`smartAccount.swap`)**: Best for most use cases. Simple, handles everything automatically.
* **Price only (`getSwapPrice`)**: For displaying exchange rates, building price calculators, or checking liquidity without executing. Suitable when frequent price updates are needed - although the data may be slightly less precise.
* **Create then execute (`account.quoteSwap`/`smartAccount.quoteSwap`)**: When you need to inspect swap details, implement custom logic, or handle complex scenarios before execution. Note: May reserve funds on-chain and is more strictly rate-limited.

#### Key differences between Regular Accounts (EOAs) and Smart Accounts:

* **Regular accounts (EOAs)** return `transactionHash`and execute immediately on-chain
* **Smart accounts** return`userOpHash` and execute via user operations with optional gas sponsorship through paymasters
* **Smart accounts** require an owner account for signing operations
* **Smart accounts** support batch operations and advanced account abstraction features

All approaches handle Permit2 signatures automatically for ERC20 token swaps. Make sure tokens have proper allowances set for the Permit2 contract before swapping.

#### Example implementations

To help you get started with token swaps in your application, we provide the following fully-working examples demonstrating different scenarios:

**Regular account (EOA) swap examples:**

* [Execute a swap transaction using account (RECOMMENDED)](https://github.com/coinbase/cdp-sdk/blob/main/examples/typescript/evm/swaps/account.swap.ts) - All-in-one regular account swap execution
* [Quote swap using account convenience method](https://github.com/coinbase/cdp-sdk/blob/main/examples/typescript/evm/swaps/account.quoteSwap.ts) - Account convenience method for creating quotes
* [Two-step quote and execute process](https://github.com/coinbase/cdp-sdk/blob/main/examples/typescript/evm/swaps/account.quoteSwapAndExecute.ts) - Detailed two-step approach with analysis
* [Swap with network hoisting](https://github.com/coinbase/cdp-sdk/blob/main/examples/typescript/evm/swaps/account.swapWithNetworkHoisting.ts) - All-in-one swap and two-step approach swap for EVM chains

**Smart account swap examples:**

* [Execute a swap transaction using smart account (RECOMMENDED)](https://github.com/coinbase/cdp-sdk/blob/main/examples/typescript/evm/smart-accounts/swap.ts) - All-in-one smart account swap execution with user operations and optional paymaster support
* [Quote swap using smart account convenience method](https://github.com/coinbase/cdp-sdk/blob/main/examples/typescript/evm/smart-accounts/smartAccount.quoteSwap.ts) - Smart account convenience method for creating quotes
* [Two-step quote and execute process](https://github.com/coinbase/cdp-sdk/blob/main/examples/typescript/evm/smart-accounts/smartAccount.quoteSwapAndExecute.ts) - Detailed two-step approach with analysis
* [Smart account swap with network hoisting](https://github.com/coinbase/cdp-sdk/blob/main/examples/typescript/evm/swaps/smartAccount.swapWithNetworkHoisting.ts) - All-in-one smart account swap and two-step approach smart account swap for EVM chains

**BYO wallet (viem) regular account (EOA) swap examples:**

* [Execute a swap transaction using viem account](https://github.com/coinbase/cdp-sdk/blob/main/examples/typescript/evm/ecosystem/viem/viem.account.swap.ts) - All-in-one swap execution with viem wallets
* [Two-step quote and execute process using viem account](https://github.com/coinbase/cdp-sdk/blob/main/examples/typescript/evm/ecosystem/viem/viem.account.quoteSwapAndExecute.ts) - Detailed two-step approach with viem wallets

**BYO wallet (viem + account abstraction) smart account swap examples:**

* [Execute a swap transaction using viem smart account](https://github.com/coinbase/cdp-sdk/blob/main/examples/typescript/evm/ecosystem/viem/viem.smartAccount.swap.ts) - All-in-one smart account swap with custom bundler/paymaster setup
* [Two-step quote and execute process using viem smart account](https://github.com/coinbase/cdp-sdk/blob/main/examples/typescript/evm/ecosystem/viem/viem.smartAccount.quoteSwapAndExecute.ts) - Advanced account abstraction integration

**Note:** The viem smart account examples require additional dependencies (`permissionless`package) and external service setup (bundler, optional paymaster). For simpler smart account usage, consider CDP's built-in smart account features instead.

### Transferring tokens

#### EVM

For complete examples, check out [evm/transactions/account.transfer.ts](https://github.com/coinbase/cdp-sdk/blob/main/examples/typescript/evm/transactions/account.transfer.ts) and [evm/smart-accounts/transfer.ts](https://github.com/coinbase/cdp-sdk/blob/main/examples/typescript/evm/smart-accounts/transfer.ts)

You can transfer tokens between accounts using the`transfer`function:
#### Code```typescript
const sender = await cdp.evm.createAccount({ name: "Sender" });

const { transactionHash } = await sender.transfer({
 to: "0x9F663335Cd6Ad02a37B633602E98866CF944124d",
 amount: 10000n, // equivalent to 0.01 USDC
 token: "usdc",
 network: "base-sepolia",
});
```You can then [wait for the transaction receipt with a viem Public Client](https://viem.sh/docs/actions/public/waitForTransactionReceipt#waitfortransactionreceipt)
#### Code```typescript
import { createPublicClient, http } from "viem";
import { baseSepolia } from "viem/chains";

const publicClient = createPublicClient({
 chain: baseSepolia,
 transport: http,
});

const receipt = await publicClient.waitForTransactionReceipt({ hash: transactionHash });
```Smart Accounts also have a`transfer`function:
#### Code```typescript
const sender = await cdp.evm.createSmartAccount({
 owner: privateKeyToAccount(generatePrivateKey),
});
console.log("Created smart account", sender);

const { userOpHash } = await sender.transfer({
 to: "0x9F663335Cd6Ad02a37B633602E98866CF944124d",
 amount: 10000n, // equivalent to 0.01 USDC
 token: "usdc",
 network: "base-sepolia",
});
```One difference is that the`transfer`function returns the user operation hash, which is different from the transaction hash. You can use the returned user operation hash in a call to`waitForUserOperation`to get the result of the transaction:
#### Code```typescript
const receipt = await sender.waitForUserOperation({
 hash: userOpHash,
});

if (receipt.status === "complete") {
 console.log(
`Transfer successful! Explorer link: https://sepolia.basescan.org/tx/${receipt.userOpHash}`
 );
} else {
 console.log(`Something went wrong! User operation hash: ${receipt.userOpHash}`);
}
```Using Smart Accounts, you can also specify a paymaster URL:
#### Code```typescript
await sender.transfer({
 to: "0x9F663335Cd6Ad02a37B633602E98866CF944124d",
 amount: "0.01",
 token: "usdc",
 network: "base-sepolia",
 paymasterUrl: "https://some-paymaster-url.com
});
```
Transfer amount must be passed as a bigint. To convert common tokens from whole units, you can use utilities such as [`parseEther`](https://viem.sh/docs/utilities/parseEther#parseether) and [`parseUnits`](https://viem.sh/docs/utilities/parseUnits#parseunits) from viem.
#### Code
```typescript
await sender.transfer({
 to: "0x9F663335Cd6Ad02a37B633602E98866CF944124d",
 amount: parseUnits("0.01", 6), // USDC has 6 decimals
 token: "usdc",
 network: "base-sepolia",
});
```You can pass`usdc`or`eth`as the token to transfer, or you can pass a contract address directly:
#### Code```typescript
await sender.transfer({
 to: "0x9F663335Cd6Ad02a37B633602E98866CF944124d",
 amount: parseUnits("0.000001", 18), // WETH has 18 decimals. equivalent to calling `parseEther("0.000001")`token: "0x4200000000000000000000000000000000000006", // WETH on Base Sepolia
 network: "base-sepolia",
});```You can also pass another account as the`to`parameter:
#### Code```typescript
const sender = await cdp.evm.createAccount({ name: "Sender" });

const receiver = await cdp.evm.createAccount({ name: "Receiver" });

await sender.transfer({
 to: receiver,
 amount: 10000n, // equivalent to 0.01 USDC
 token: "usdc",
 network: "base-sepolia",
});
```#### Solana

For complete examples, check out [solana/account.transfer.ts](https://github.com/coinbase/cdp-sdk/blob/main/examples/typescript/solana/transactions/account.transfer.ts)

You can transfer tokens between accounts using the`transfer`function, and wait for the transaction to be confirmed using the`confirmTransaction`function from`@solana/web3.js`:
#### Code
```typescript
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

const sender = await cdp.solana.createAccount;

const connection = new Connection("https://api.devnet.solana.com;

const { signature } = await sender.transfer({
 to: "3KzDtddx4i53FBkvCzuDmRbaMozTZoJBb1TToWhz3JfE",
 amount: 0.01 * LAMPORTS_PER_SOL,
 token: "sol",
 network: connection,
});

const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash;

const confirmation = await connection.confirmTransaction(
 {
signature,
blockhash,
lastValidBlockHeight,
 },
 "confirmed",
);

if (confirmation.value.err) {
 console.log(`Something went wrong! Error: ${confirmation.value.err.toString}`);
} else {
 console.log(
`Transaction confirmed: Link: https://explorer.solana.com/tx/${signature}?cluster=devnet`);
}```You can also easily send USDC:
#### Code```typescript
const { signature } = await sender.transfer({
 to: "3KzDtddx4i53FBkvCzuDmRbaMozTZoJBb1TToWhz3JfE",
 amount: "0.01",
 token: "usdc",
 network: "devnet",
});
```If you want to use your own Connection, you can pass one to the`network`parameter:
#### Code```typescript
import { Connection } from "@solana/web3.js";

const connection = new Connection("YOUR_RPC_URL");

const { signature } = await sender.transfer({
 to: "3KzDtddx4i53FBkvCzuDmRbaMozTZoJBb1TToWhz3JfE",
 amount: "0.01",
 token: "usdc",
 network: connection,
});
```## Account Actions

Account objects have actions that can be used to interact with the account. These can be used in place of the`cdp`client.

### EVM account actions

Here are some examples for actions on EVM accounts.

For example, instead of:
#### Code```typescript
const balances = await cdp.evm.listTokenBalances({
 address: account.address,
 network: "base-sepolia",
});
```You can use the`listTokenBalances`action:
#### Code```typescript
const account = await cdp.evm.createAccount;
const balances = await account.listTokenBalances({ network: "base-sepolia" });
```EvmAccount supports the following actions:

*`listTokenBalances`*`requestFaucet`*`signTransaction`*`sendTransaction`*`transfer`EvmSmartAccount supports the following actions:

*`listTokenBalances`*`requestFaucet`*`sendUserOperation`*`waitForUserOperation`*`getUserOperation`*`transfer`### Solana account actions

Here are some examples for actions on Solana accounts.
#### Code```typescript
const balances = await cdp.solana.signMessage({
 address: account.address,
 message: "Hello, world!",
});
```You can use the`signMessage`action:
#### Code```typescript
const account = await cdp.solana.createAccount;
const { signature } = await account.signMessage({
 message: "Hello, world!",
});
```SolanaAccount supports the following actions:

*`requestFaucet`*`signMessage`*`signTransaction`## Policy Management

You can use the policies SDK to manage sets of rules that govern the behavior of accounts and projects, such as enforce allowlists and denylists.

### Create a Project-level policy that applies to all accounts

This policy will accept any account sending less than a specific amount of ETH to a specific address.
#### Code```typescript
const policy = await cdp.policies.createPolicy({
 policy: {
scope: "project",
description: "Project-wide Allowlist Policy",
rules: [
 {
action: "accept",
operation: "signEvmTransaction",
criteria: [
 {
type: "ethValue",
ethValue: "1000000000000000000",
operator: "<=",
 },
 {
type: "evmAddress",
addresses: ["0x000000000000000000000000000000000000dEaD"],
operator: "in",
 },
],
 },
],
 },
});
```### Create an Account-level policy

This policy will accept any transaction with a value less than or equal to 1 ETH to a specific address.
#### Code```typescript
const policy = await cdp.policies.createPolicy({
 policy: {
scope: "account",
description: "Account Allowlist Policy",
rules: [
 {
action: "accept",
operation: "signEvmTransaction",
criteria: [
 {
type: "ethValue",
ethValue: "1000000000000000000",
operator: "<=",
 },
 {
type: "evmAddress",
addresses: ["0x000000000000000000000000000000000000dEaD"],
operator: "in",
 },
],
 },
],
 },
});
```### Create a Solana Allowlist Policy
#### Code```typescript
const policy = await cdp.policies.createPolicy({
 policy: {
scope: "account",
description: "Account Allowlist Policy",
rules: [
 {
action: "accept",
operation: "signSolTransaction",
criteria: [
 {
type: "solAddress",
addresses: ["DtdSSG8ZJRZVv5Jx7K1MeWp7Zxcu19GD5wQRGRpQ9uMF"],
operator: "in",
 },
],
 },
],
 },
});
```### List Policies

You can filter by account:
#### Code```typescript
const policy = await cdp.policies.listPolicies({
 scope: "account",
});
```You can also filter by project:
#### Code```typescript
const policy = await cdp.policies.listPolicies({
 scope: "project",
});
```### Retrieve a Policy
#### Code```typescript
const policy = await cdp.policies.getPolicyById({
 id: "__POLICY_ID__",
});
```### Update a Policy

This policy will update an existing policy to accept transactions to any address except one.
#### Code```typescript
const policy = await cdp.policies.updatePolicy({
 id: "__POLICY_ID__",
 policy: {
description: "Updated Account Denylist Policy",
rules: [
 {
action: "accept",
operation: "signEvmTransaction",
criteria: [
 {
type: "evmAddress",
addresses: ["0x000000000000000000000000000000000000dEaD"],
operator: "not in",
 },
],
 },
],
 },
});
```### Delete a Policy

> \[!WARNING] Attempting to delete an account-level policy in-use by at least one account will fail.
#### Code```typescript
const policy = await cdp.policies.deletePolicy({
 id: "__POLICY_ID__",
});
```### Validate a Policy

If you're integrating policy editing into your application, you may find it useful to validate policies ahead of time to provide a user with feedback. The`CreatePolicyBodySchema`and`UpdatePolicyBodySchema`can be used to get actionable structured information about any issues with a policy. Read more about [handling ZodErrors](https://zod.dev/basics#handling-errors)
#### Code```ts
import { CreatePolicyBodySchema, UpdatePolicyBodySchema } from "@coinbase/cdp-sdk";

// Validate a new Policy with many issues, will throw a ZodError with actionable validation errors
try {
 CreatePolicyBodySchema.parse({
description: "Bad description with !#@ characters, also is wayyyyy toooooo long!!",
rules: [
 {
action: "acept",
operation: "unknownOperation",
criteria: [
 {
type: "ethValue",
ethValue: "not a number",
operator: "<=",
 },
 {
type: "evmAddress",
addresses: ["not an address"],
operator: "in",
 },
 {
type: "evmAddress",
addresses: ["not an address"],
operator: "invalid operator",
 },
],
 },
],
 });
} catch (e) {
 console.error(e);
}
```#### Supported Policy Rules

We currently support the following policy rules:

* [SignEvmTransactionRule](https://docs.cdp.coinbase.com/api-reference/v2/rest-api/policy-engine/create-a-policy#signevmtransactionrule)
* [SendEvmTransactionRule](https://docs.cdp.coinbase.com/api-reference/v2/rest-api/policy-engine/create-a-policy#sendevmtransactionrule)
* [SignEvmMessageRule](https://docs.cdp.coinbase.com/api-reference/v2/rest-api/policy-engine/create-a-policy#signevmmessagerule)
* [SignEvmTypedDataRule](https://docs.cdp.coinbase.com/api-reference/v2/rest-api/policy-engine/create-a-policy#signevmtypeddatarule)
* [SignSolanaTransactionRule](https://docs.cdp.coinbase.com/api-reference/v2/rest-api/policy-engine/create-a-policy#signsolanatransactionrule)
* [SendSolanaTransactionRule](https://docs.cdp.coinbase.com/api-reference/v2/rest-api/policy-engine/create-a-policy#sendsolanatransactionrule)
* [SignEvmHashRule](https://docs.cdp.coinbase.com/api-reference/v2/rest-api/policy-engine/create-a-policy#signevmhashrule)
* [PrepareUserOperationRule](https://docs.cdp.coinbase.com/api-reference/v2/rest-api/policy-engine/create-a-policy#prepareuseroperationrule)
* [SendUserOperationRule](https://docs.cdp.coinbase.com/api-reference/v2/rest-api/policy-engine/create-a-policy#senduseroperationrule)

### End-user Management

You can use the End User SDK to manage the users of your applications.

#### Validate Access Token

When your end user has signed in with an [Embedded Wallet](https://docs.cdp.coinbase.com/embedded-wallets/welcome you can check whether the access token they were granted is valid, and which of your user's it is associated with.
#### Code```typescript
try {
 const endUser = await cdp.endUser.validateAccessToken({
 accessToken,
 });
 console.log(endUser)
} catch(e) {
 // the access token is not valid or expired
}
```## Authentication tools

This SDK also contains simple tools for authenticating REST API requests to the [Coinbase Developer Platform (CDP)](https://docs.cdp.coinbase.com/ See the [Auth README](/sdks/cdp-sdks-v2/typescript/auth) for more details.

## Error Reporting

This SDK contains error reporting functionality that sends error events to CDP. If you would like to disable this behavior, you can set the`DISABLE_CDP_ERROR_REPORTING`environment variable to`true`.
#### Command
```bash
DISABLE_CDP_ERROR_REPORTING=true
```## Usage Tracking

This SDK contains usage tracking functionality that sends usage events to CDP. If you would like to disable this behavior, you can set the`DISABLE_CDP_USAGE_TRACKING`environment variable to`true`.

## License

This project is licensed under the MIT License - see the [LICENSE](https://github.com/coinbase/cdp-sdk/blob/main/LICENSE.md) file for details.

## Support

For feature requests, feedback, or questions, please reach out to us in the **#cdp-sdk** channel of the Coinbase Developer Platform Discord.

* [API Reference](https://docs.cdp.coinbase.com/api-v2/docs/welcome)
* [SDK Docs](https://coinbase.github.io/cdp-sdk/typescript)
* [GitHub Issues](https://github.com/coinbase/cdp-sdk/issues)

## Security

If you discover a security vulnerability within this SDK, please see our [Security Policy](https://github.com/coinbase/cdp-sdk/blob/main/SECURITY.md) for disclosure information.

## FAQ

Common errors and their solutions.

### AggregateError \[ETIMEDOUT]

This is an issue in Node.js itself: https://github.com/nodejs/node/issues/54359 While [the fix](https://github.com/nodejs/node/pull/56738) is implemented, the workaround is to set the environment variable:
#### Command
```bash
export NODE_OPTIONS="--network-family-autoselection-attempt-timeout=500"
```### Error \[ERR\_REQUIRE\_ESM]: require of ES modules is not supported.

Use Node v20.19.0 or higher. CDP SDK depends on [jose](https://github.com/panva/jose) v6, which ships only ESM. Jose supports CJS style imports in Node.js versions where the require(esm) feature is enabled by default (^20.19.0 || ^22.12.0 || >= 23.0.0). [See here for more info](https://github.com/panva/jose?tab=readme-ov-file#user-content-fn-cjs-705c79d785ca9bc0f9ec1e8ce0825c74)

### Jest encountered an unexpected token

If you're using Jest and see an error like this:```Details:

/Users/.../node_modules/jose/dist/webapi/index.js:1
({"Object.<anonymous>":function(module,exports,require,__dirname,__filename,jest){export { compactDecrypt } from './jwe/compact/decrypt.js';
 ^^^^^^

SyntaxError: Unexpected token 'export'```Add a file called`jest.setup.ts`next to your`jest.config`file with the following content:
#### Code```typescript
jest.mock("jose", => {});
```Then, add the following line to your`jest.config`file:
#### Code```typescript
setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
```# CDP Client

## Classes

### CdpClient

Defined in: [cdp.ts:25](https://github.com/coinbase/cdp-sdk/blob/8794662b60e721852bfb60801a1d0bb1bb6e4c59/typescript/src/client/cdp.ts#L25)

The main client for interacting with the CDP API.

#### Constructors

##### Constructor
#### Code```ts
new CdpClient(options?: CdpClientOptions): CdpClient;
```
Defined in: [cdp.ts:73](https://github.com/coinbase/cdp-sdk/blob/8794662b60e721852bfb60801a1d0bb1bb6e4c59/typescript/src/client/cdp.ts#L73)

The CdpClient is the main class for interacting with the CDP API.

There are a few required parameters that are configured in the [CDP Portal](https://portal.cdp.coinbase.com/projects/api-keys)

* **CDP Secret API Key** (`apiKeyId`&`apiKeySecret`): These are used to authenticate requests to the entire suite of
 APIs offered on Coinbase Developer Platform.
 [Read more about CDP API keys](https://docs.cdp.coinbase.com/get-started/docs/cdp-api-keys)
* **Wallet Secret** (`walletSecret`): This secret is used specifically to authenticate requests to `POST`, and `DELETE`endpoints in the EVM and Solana Account APIs.

These parameters can be set as environment variables:```CDP_API_KEY_ID=your-api-key-id
CDP_API_KEY_SECRET=your-api-key-secret
CDP_WALLET_SECRET=your-wallet-secret```Or passed as options to the constructor:
#### Code```typescript
const cdp = new CdpClient({
 apiKeyId: "your-api-key-id",
 apiKeySecret: "your-api-key-secret",
 walletSecret: "your-wallet-secret",
});
```The CdpClient is namespaced by chain type:`evm`or`solana`.

As an example, to create a new EVM account, use `cdp.evm.createAccount`.

To create a new Solana account, use `cdp.solana.createAccount`.

###### Parameters

###### options?

[`CdpClientOptions`](/sdks/cdp-sdks-v2/typescript/client/cdp-client#cdpclientoptions) = `{}`

Configuration options for the CdpClient.

###### Returns

[`CdpClient`](/sdks/cdp-sdks-v2/typescript/client/cdp-client#cdpclient)

#### Properties

##### endUser
#### Code
```ts
endUser: CDPEndUserClient;
```Defined in: [cdp.ts:36](https://github.com/coinbase/cdp-sdk/blob/8794662b60e721852bfb60801a1d0bb1bb6e4c59/typescript/src/client/cdp.ts#L36)

Namespace containing all end user methods.

##### evm
#### Code```ts
evm: EvmClient;
```Defined in: [cdp.ts:27](https://github.com/coinbase/cdp-sdk/blob/8794662b60e721852bfb60801a1d0bb1bb6e4c59/typescript/src/client/cdp.ts#L27)

Namespace containing all EVM methods.

##### policies
#### Code```ts
policies: PoliciesClient;
```Defined in: [cdp.ts:33](https://github.com/coinbase/cdp-sdk/blob/8794662b60e721852bfb60801a1d0bb1bb6e4c59/typescript/src/client/cdp.ts#L33)

Namespace containing all Policies methods.

##### solana
#### Code```ts
solana: SolanaClient;
```Defined in: [cdp.ts:30](https://github.com/coinbase/cdp-sdk/blob/8794662b60e721852bfb60801a1d0bb1bb6e4c59/typescript/src/client/cdp.ts#L30)

Namespace containing all Solana methods.

## Interfaces

### CdpClientOptions

Defined in: [cdp.ts:9](https://github.com/coinbase/cdp-sdk/blob/8794662b60e721852bfb60801a1d0bb1bb6e4c59/typescript/src/client/cdp.ts#L9)

#### Properties

##### apiKeyId?
#### Code```ts
optional apiKeyId: string;
```Defined in: [cdp.ts:11](https://github.com/coinbase/cdp-sdk/blob/8794662b60e721852bfb60801a1d0bb1bb6e4c59/typescript/src/client/cdp.ts#L11)

The API key ID.

##### apiKeySecret?
#### Code```ts
optional apiKeySecret: string;
```Defined in: [cdp.ts:13](https://github.com/coinbase/cdp-sdk/blob/8794662b60e721852bfb60801a1d0bb1bb6e4c59/typescript/src/client/cdp.ts#L13)

The API key secret.

##### basePath?
#### Code```ts
optional basePath: string;
```Defined in: [cdp.ts:19](https://github.com/coinbase/cdp-sdk/blob/8794662b60e721852bfb60801a1d0bb1bb6e4c59/typescript/src/client/cdp.ts#L19)

The host URL to connect to.

##### debugging?
#### Code```ts
optional debugging: boolean;
```Defined in: [cdp.ts:17](https://github.com/coinbase/cdp-sdk/blob/8794662b60e721852bfb60801a1d0bb1bb6e4c59/typescript/src/client/cdp.ts#L17)

Whether to enable debugging.

##### walletSecret?
#### Code```ts
optional walletSecret: string;
```Defined in: [cdp.ts:15](https://github.com/coinbase/cdp-sdk/blob/8794662b60e721852bfb60801a1d0bb1bb6e4c59/typescript/src/client/cdp.ts#L15)

The wallet secret.



# Auth

### Overview

The following methods can be used to authenticate your requests to the [Coinbase Developer Platform (CDP)](https://docs.cdp.coinbase.com/ Choose the method that best suits your needs:

| Method | Difficulty | Description |
| :-------------------------------------------------------------------------- | :----------- | :----------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Use an Axios request client](#use-an-axios-request-interceptor) | Easy | Use an [Axios](https://axios-http.com/docs/intro) client with a pre-configured interceptor that automatically handles authentication for all requests. |
| [Generate your authorization headers](#generate-your-authorization-headers) | Intermediate | Generate authentication headers and apply them to your preferred HTTP client. |
| [Generate a JWT](#generate-a-jwt) | Advanced | Generate a JWT token, manually create your authentication headers, and apply them to your preferred HTTP client. |

Visit the [CDP Authentication docs](https://docs.cdp.coinbase.com/api-v2/docs/authentication) for more details.

### Generate a JWT

The following example shows how to generate a JWT token, which can then be injected manually into your`Authorization`header to authenticate REST API requests to the [CDP APIs](https://docs.cdp.coinbase.com/api-v2/docs/welcome) using the HTTP request library of your choice.

**Step 1**: Install the required package:
#### Command```bash
npm install @coinbase/cdp-sdk
```**Step 2**: Generate a JWT:
#### Code```typescript
import { generateJwt } from "@coinbase/cdp-sdk/auth";

// For REST (HTTP) requests
const jwt = await generateJwt({
 apiKeyId: "YOUR_API_KEY_ID",
 apiKeySecret: "YOUR_API_KEY_SECRET",
 requestMethod: "GET",
 requestHost: "api.cdp.coinbase.com",
 requestPath: "/platform/v2/evm/accounts",
 expiresIn: 120, // optional (defaults to 120 seconds)
});

console.log(jwt);

// For websocket connections
const websocketJwt = await generateJwt({
 apiKeyId: "YOUR_API_KEY_ID",
 apiKeySecret: "YOUR_API_KEY_SECRET",
 requestMethod: null,
 requestHost: null,
 requestPath: null,
 expiresIn: 120, // optional (defaults to 120 seconds)
});

console.log(websocketJwt);
```For information about the above parameters, please refer to the [Authentication parameters](#authentication-parameters) section.

**Step 3**: Use your JWT (Bearer token) in the`Authorization`header of your HTTP request:
#### Command```bash
curl -L 'https://api.cdp.coinbase.com/platform/v2/evm/accounts \
 -H 'Content-Type: application/json' \
 -H 'Accept: application/json' \
 -H 'Authorization: Bearer $jwt'
```### Generate your authorization headers

The following example shows how to generate the required authentication headers for authenticating a request to the [CDP REST APIs](https://docs.cdp.coinbase.com/api-v2/docs/welcome using the HTTP request library of your choice.

**Step 1**: Install the required package:
#### Command```bash
npm install @coinbase/cdp-sdk
```**Step 2**: Generate authorization headers:
#### Code```typescript
import { getAuthHeaders } from "@coinbase/cdp-sdk/auth";

const headers = await getAuthHeaders({
 apiKeyId: "YOUR_API_KEY_ID",
 apiKeySecret: "YOUR_API_KEY_SECRET",
 walletSecret: "YOUR_WALLET_SECRET",
 requestMethod: "POST",
 requestHost: "api.cdp.coinbase.com",
 requestPath: "/platform/v2/evm/accounts",
 requestBody: {
name: "MyAccount",
 },
 expiresIn: 120, // optional (defaults to 120 seconds)
});

console.log(headers);
```For information about the above parameters, please refer to the [Authentication parameters](#authentication-parameters) section.

### Use an Axios request interceptor

**Step 1**: Install the required packages:
#### Command```bash
npm install @coinbase/cdp-sdk axios
```**Step 2**: Create an authenticated Axios client:

The following example shows how to use an [Axios](https://axios-http.com/docs/intro) HTTP client with a pre-configured interceptor to authenticate your requests to the CDP REST APIs. This client will automatically add the appropriate authentication headers to each request.
#### Code```typescript
import axios from "axios";
import { axiosHooks } from "@coinbase/cdp-sdk/auth";

// Create an Axios instance
const axiosClient = axios.create({
 baseURL: "https://api.cdp.coinbase.com
});

// Add authentication to the client
axiosHooks.withAuth(axiosClient, {
 apiKeyId: "YOUR_API_KEY_ID",
 apiKeySecret: "YOUR_API_KEY_SECRET",
 walletSecret: "YOUR_WALLET_SECRET",
});

// Make authenticated requests (example)
// The appropriate authentication headers will be automatically added to the request
try {
 const response = await axiosClient.post("/platform/v2/evm/accounts", {
name: "MyAccount",
 });
 console.log(response.data);
} catch (error) {
 console.error("Request failed:", error);
}
```The Axios interceptor will automatically:

* Generate a JWT for each request
* Add the JWT to the`Authorization`header
* Set the appropriate`Content-Type`header
* Add wallet authentication when required

For information about the above parameters, please refer to the [Authentication parameters](#authentication-parameters) section.

### Authentication parameters

The following table provides more context of many of the authentication parameters used in the examples above:

| Parameter | Required | Description |
| :-------------- | :------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|`apiKeyId`| true | The unique identifier for your API key. Supported formats are:<br />-`xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`<br />- `organizations/{orgId}/apiKeys/{keyId}`|
|`apiKeySecret`| true | Your API key secret. Supported formats are:<br />- Edwards key (Ed25519):`xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx==`<br />- Elliptic Curve key (ES256): `-----BEGIN EC PRIVATE KEY-----\n...\n...\n...==\n-----END EC PRIVATE KEY-----\n`|
|`requestMethod`| true\* | The HTTP method for the API request you're authenticating (ie,`GET`, `POST`, `PUT`, `DELETE`). Can be `null`for JWTs intended for websocket connections. |
|`requestHost`| true\* | The API host you're calling (ie,`api.cdp.coinbase.com`). Can be `null`for JWTs intended for websocket connections. |
|`requestPath`| true\* | The path of the specific API endpoint you're calling (ie,`/platform/v1/wallets`). Can be `null`for JWTs intended for websocket connections. |
|`requestBody`| false | Optional request body data. |
|`expiresIn`| false | The JWT expiration time in seconds. After this time, the JWT will no longer be valid, and a new one must be generated. Defaults to`120` (ie, 2 minutes) if not specified. |

\* Either all three request parameters (`requestMethod`, `requestHost`, and `requestPath`) must be provided for REST API requests, or all three must be `null` for JWTs intended for websocket connections.

## Modules

* [Axios](/sdks/cdp-sdks-v2/typescript/auth/Axios)
* [Hash](/sdks/cdp-sdks-v2/typescript/auth/Hash)
* [HTTP](/sdks/cdp-sdks-v2/typescript/auth/HTTP)
* [JWT](/sdks/cdp-sdks-v2/typescript/auth/JWT)
* [WebSocket](/sdks/cdp-sdks-v2/typescript/auth/WebSocket)
* [Errors](/sdks/cdp-sdks-v2/typescript/auth/Errors)


## Frontend

# Overview

The Coinbase Developer Platform (CDP) Frontend SDK allows developers to provide embedded wallets and other
onchain primitives to their end users in their frontend applications.

The CDP Frontend SDK consists of several Typescript packages:

1. [@coinbase/cdp-core](/sdks/cdp-sdks-v2/frontend/@coinbase/cdp-core/reference) - Core business logic to access the embedded wallet APIs
2. [@coinbase/cdp-hooks](/sdks/cdp-sdks-v2/frontend/@coinbase/cdp-hooks/reference) - React hooks for state management of end users with embedded wallets
3. [@coinbase/cdp-react](/sdks/cdp-sdks-v2/frontend/@coinbase/cdp-react/reference) - Off-the-shelf UI components for embedded wallets
4. [@coinbase/cdp-wagmi](/sdks/cdp-sdks-v2/frontend/@coinbase/cdp-wagmi/reference) - Embedded wallet connector for Wagmi
5. [@coinbase/cdp-solana-standard-wallet](/sdks/cdp-sdks-v2/frontend/@coinbase/cdp-solana-standard-wallet/reference) - Solana wallet implementation compatible with the Wallet Standard
6. [@coinbase/create-cdp-app](/sdks/cdp-sdks-v2/frontend/@coinbase/create-cdp-app/index) - A CLI for creating a starter app using the packages above

Click on any of the packages above for further information on how to install and integrate the CDP Frontend SDK.

## Quickstart

To get started immediately, refer to the Quickstart for the [@coinbase/create-cdp-app module](/sdks/cdp-sdks-v2/frontend/@coinbase/create-cdp-app/index).



## CDP SDKs V1

TypeScript: https://coinbase.github.io/coinbase-sdk-nodejs/index.html

@coinbase/coinbase-sdk
Coinbase Node.js SDK
npm version npm weekly downloads

The Coinbase Node.js SDK enables the simple integration of crypto into your app. By calling Coinbase's Platform APIs, the SDK allows you to provision crypto wallets, send crypto into/out of those wallets, track wallet balances, and trade crypto from one asset into another.

The SDK supports various verbs on Developer-custodied Wallets across multiple networks, as documented here.

Note: As the SDK provides new capabilities and improves the developer experience, updates may occasionally include breaking changes. These will be documented in the CHANGELOG.md file.

## Documentation
## CDP API Documentation
## Requirements
The Coinbase server-side SDK requires Node.js version 18 or higher and npm version 9.7.2 or higher. To view your currently installed versions of Node.js, run the following from the command-line:

node -v
npm -v
## Copy
We recommend installing and managing Node.js and npm versions with nvm. See Installing and Updating in the nvm README for instructions on how to install nvm.

Once nvm has been installed, you can install and use the latest versions of Node.js and npm by running the following commands:

nvm install node # "node" is an alias for the latest version
nvm use node
## Copy
## Installation
Optional: Initialize the npm

This command initializes a new npm project with default settings and configures it to use ES modules by setting the type field to "module" in the package.json file.

npm init -y; npm pkg set type="module"
## Copy
You can import the SDK as follows
npm install @coinbase/coinbase-sdk
## Copy
or

yarn add @coinbase/coinbase-sdk
## Copy
## Usage
## Initialization
You can import the SDK as follows:
CommonJs:

const { Coinbase, Wallet } = require("@coinbase/coinbase-sdk");
## Copy
ES modules:

import { Coinbase, Wallet } from "@coinbase/coinbase-sdk";
## Copy
To start, create a CDP API Key. Then, initialize the Platform SDK by passing your API Key name and API Key's private key via the Coinbase constructor:

const apiKeyName = "Copy your API Key name here.";

const privateKey = "Copy your API Key's private key here.";

Coinbase.configure({ apiKeyName: apiKeyName, privateKey: privateKey });
## Copy
If you are using a CDP Server-Signer to manage your private keys, enable it with the constuctor option:

Coinbase.configure({ apiKeyName: apiKeyName, privateKey: apiKeyPrivateKey, useServerSigner: true })
## Copy
Another way to initialize the SDK is by sourcing the API key from the json file that contains your API key, downloaded from CDP portal.

Coinbase.configureFromJson({ filePath: "path/to/your/api-key.json" });
## Copy
This will allow you to authenticate with the Platform APIs.

CommonJs:

const { Coinbase, Wallet } = require("@coinbase/coinbase-sdk");
Coinbase.configureFromJson("path/to/your/api-key.json");

// List all Wallets for the CDP Project.
Wallet.listWallets.then(resp => {
 console.log(resp.data);
});
## Copy
Or using ES modules and async/await:

import { Coinbase, Wallet } from "@coinbase/coinbase-sdk";
Coinbase.configureFromJson("path/to/your/api-key.json");

// List all Wallets for the CDP Project.
const resp = await Wallet.listWallets;
console.log(resp.data);
## Copy
Wallets, Addresses, and Transfers
Now, create a Wallet which will default to the Base Sepolia testnet network (if not specified).

// Create a Wallet with one Address by default.
const wallet = await Wallet.create;
## Copy
Next, view the default Address of your Wallet. You will need this default Address in order to fund the Wallet for your first Transfer.

// A Wallet has a default Address.
const address = await wallet.getDefaultAddress;
console.log(`Address: ${address}`);
## Copy
Wallets do not have funds on them to start. In order to fund the Address, you will need to send funds to the Wallet you generated above. If you don't have testnet funds, get funds from a faucet.

For development purposes, we provide a faucet method to fund your address with ETH on Base Sepolia testnet. We allow one faucet claim per address in a 24 hour window.

// Create a faucet request that returns you a Faucet transaction that can be used to track the tx hash.
const faucetTransaction = await wallet.faucet;
console.log(`Faucet transaction: ${faucetTransaction}`);
## Copy
// Create a new Wallet to transfer funds to.
// Then, we can transfer 0.00001 ETH out of the Wallet to another Wallet.
const anotherWallet = await Wallet.create;
let transfer = await wallet.createTransfer({ amount: 0.00001, assetId: Coinbase.assets.Eth, destination: anotherWallet });
transfer = await transfer.wait;
## Copy
## Gasless USDC Transfers
To transfer USDC without needing to hold ETH for gas, you can use the createTransfer method with the gasless option set to true.

let transfer = await wallet.createTransfer({ amount: 0.00001, assetId: Coinbase.assets.Usdc, destination: anotherWallet, gasless: true });
transfer = await transfer.wait;
## Copy
By default, gasless transfers are batched with other transfers, and might take longer to submit. If you want to opt out of batching, you can set the skipBatching option to true, which will submit the transaction immediately.

let transfer = await wallet.createTransfer({
 amount: 0.00001,
 assetId: Coinbase.assets.Usdc,
 destination: anotherWallet,
 gasless: true,
 skipBatching: true
});
transfer = await transfer.wait;
## Copy
## Trading Funds
// Create a Wallet on `base-mainnet` to trade assets with.
let mainnetWallet = await Wallet.create({ networkId: Coinbase.networks.BaseMainnet });

console.log(`Wallet successfully created: ${mainnetWallet}`);

// Fund your Wallet's default Address with ETH from an external source.

// Trade 0.00001 ETH to USDC
let trade = await wallet.createTrade({ amount: 0.00001, fromAssetId: Coinbase.assets.Eth, toAssetId: Coinbase.assets.Usdc });
trade = await trade.wait;

console.log(`Trade successfully completed: ${trade}`);
## Copy
## Re-Instantiating Wallets
The SDK creates Wallets with developer managed keys, which means you are responsible for securely storing the keys required to re-instantiate Wallets. The below code walks you through how to export a Wallet and store it in a secure location.

// Export the data required to re-instantiate the Wallet.
const data = wallet.export;
## Copy
In order to persist the data for the Wallet, you will need to implement a store method to store the data export in a secure location. If you do not store the Wallet in a secure location you will lose access to the Wallet and all of the funds on it.

// At this point, you should implement your own "store" method to securely persist
// the data required to re-instantiate the Wallet at a later time.
await store(data);
## Copy
For convenience during testing, we provide a saveSeed method that stores the wallet's seed in your local file system. This is an insecure method of storing wallet seeds and should only be used for development purposes.

const seedFilePath = "";
wallet.saveSeedToFile(seedFilePath);
## Copy
To encrypt the saved data, set encrypt to true. Note that your CDP API key also serves as the encryption key for the data persisted locally. To re-instantiate wallets with encrypted data, ensure that your SDK is configured with the same API key when invoking saveSeed and loadSeed.

wallet.saveSeedToFile(seedFilePath, true);
## Copy
The below code demonstrates how to re-instantiate a Wallet from the data export.

// The Wallet can be re-instantiated using the exported data.
const importedWallet = await Wallet.import(data);
## Copy
To import Wallets that were persisted to your local file system using saveSeed, use the below code.

const userWallet = await Wallet.fetch(wallet.getId);
await userWallet.loadSeedFromFile(seedFilePath);
## Copy
## Acknowledgments
This project includes code from viem licensed under MIT.
# CDP — Paymaster & Bundler — Hazır (BaseMan)

- Kaynak: https://docs.cdp.coinbase.com/ (resmi doküman)
- Son hazırlayan: 2025-11-02

Amaç
- BaseMan’de gas sponsorluğu (opsiyonel) ve AA işlemlerini CDP Paymaster/Bundler ile uyumlu biçimde çalıştırmak; allowlist/policy ve ortam değişkenlerini netleştirmek.

## Temel Kavramlar
- ERC‑4337 (AA) ve ERC‑7677 uyumlu Paymaster.
- Desteklenen yöntemler: `pm_getPaymasterStubData`, `pm_getPaymasterData`(sponsorlu akış için).
- Bundler erişimi aynı endpoint üzerinden sağlanır (CDP).

Kurulum ve Policy
- CDP Portal: Bundler & Paymaster ürününden endpoint alın.
- Allowlist/Policy: En az bir sözleşmeyi allowlist edin; mümkünse proxy/allowlist ile hedef adres/selector kısıtlayın.
- Ortam Değişkenleri:`NEXT_PUBLIC_PAYMASTER_AND_BUNDLER_ENDPOINT`veya sunucu tarafı paymaster URL’leri; sponsor limit/policy ayarları.

Entegrasyon Akışı (Özet)
1) Kullanıcının oluşturduğu UserOperation (veya normal tx) için sponsor talebi (stub veya full paymaster data).
2) Dönen`paymasterAndData`ile tx/AA işlemi oluşturulur ve gönderilir.
3) Başarısızlıklarda policy/logları kontrol edin (bütçe, allowlist, selector hataları vb.).

Uygulama Kontrol Listesi (CDP)
- [ ] CDP’de Paymaster & Bundler endpoint oluşturuldu
- [ ] Allowlist: hedef sözleşme(adres) + method(selector) kısıtlamaları tanımlı
- [ ] Ortam değişkenleri projeye işlendi (staging/prod ayrımı)
- [ ] Sponsor akışı smoke testi (stub→data) başarılı
- [ ] Başarısız denemeler için hata mesajları/loglar incelendi

BaseMan Eşleştirmesi
- Proxy katmanı:`api/paymaster-proxy.js`(allowlist ve yönlendirme)
- Env:`.env`içinde paymaster/bundler URL’leri, izinli hedef/selector listeleri
- Test/Scripts:`scripts/check:sponsor`, `scripts/e2e-sponsor.mjs` (varsa) ile doğrulama

## Notlar
- Sponsorluk kapsamını minimal tutun; selector/target bazlı kısıtlamayı zorunlu hale getirin.
- Sepolia ve Mainnet için ayrık anahtarlar/policy kullanın.

---- Hazır Özet Sonu — Aşağıda ham kaynak içerik bulunur ----


[Back to top](#table-of-contents)
