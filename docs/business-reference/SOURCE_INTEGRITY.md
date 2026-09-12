# Kleenest Business Source Integrity Manifest

This file records exact filenames, sizes and SHA-256 checksums for source bundles and the current v9/v10 core files that were materialized during the September 2026 deep audit.

The checksums make it possible to verify that a future re-upload, Drive copy, ZIP extraction or repository migration is byte-for-byte the same artifact.

## Current v9/v10 core files

| File | Bytes | SHA-256 |
|---|---:|---|
| Kleenest_Business_Plan_Executive_Summary_v9.docx | 38,934 | `38a7c52d770709657cd9828688c0d18f64a29dade22beba8675cd6a671e03e12` |
| Kleenest_Business_Plan_Executive_Summary_v9.pdf | 107,168 | `bc081cac8da211b8d69928f73deefe9bac23fcd203c134fb6549b07651874071` |
| Kleenest_Detailed_Business_Plan_v9.docx | 40,325 | `db45eedb18460ab74f1dff5c83f39254529347577bac53e9ef2efd790aaa36c4` |
| Kleenest_Detailed_Business_Plan_v9.pdf | 129,722 | `a19250e7ffa7f4c22dcf496827a8294b40bc75e4ea2ad7a3164a558d5068b12c` |
| Kleenest_Detailed_Financial_Model_v9.xlsx | 126,964 | `af8abdf93ebb34123588f5ab2240ae4c3e835eaec2a666cba6f7bdbec083038f` |
| Kleenest_Specific_Outreach_Plan_v9.docx | 38,500 | `417f795e3df66a935b3685a391613c6212aaf32517c997bae87aca98226965b6` |
| Kleenest_Specific_Outreach_Plan_v9.pdf | 68,561 | `62820255c0f57faae1cd44b571a4d0437139bec9e2eb541ea5466231da669812` |
| Kleenest_Meeting_Playbook_v9.docx | 37,507 | `9eaa74b1675735c0ed89b9ef03330f88f5c3bdcccfde8b848175be0c51ed880d` |
| Kleenest_Meeting_Playbook_v9.pdf | 54,921 | `a3bc935bf6e8723572bcb4c2a84c43c151733a04bbe4b28355e0aabb85d6d2b5` |
| Kleenest_Cortex_SQ1_Materials_v9.pptx | 37,328 | `2e211ae846601c0e3c2d876c9654f8fd02d152c0e92e53915570e3c44de99b73` |
| Kleenest_Cortex_SQ1_Materials_v9.pdf | 121,964 | `14c9694908e87f90bbec8c40f6a39dfaa0d12c91dd30a3214db4e47c5951f435` |
| Kleenest_Four_Seasons_Specific_Offer_v10.pptx | 1,060,090 | `899b83387e111c22414f512b88fd5d0d12376f700ca6cb3b5f3135b17ad8fab0` |
| Kleenest_Four_Seasons_Specific_Offer_v10.pdf | 439,233 | `f6dca9415b1a22caf8131b0fb862d07675ab042cf5ae882309ff022fde89dc01` |
| Kleenest_Four_Seasons_Specific_Offer_v10.zip | 1,198,013 | `059d3089f8ad854de4a1cfdbd1ff6b8bb6ad5fcdb825c9175133596f1ef07506` |
| Kleenest_Four_Seasons_Corrected_QR_Card_v10.png | 82,736 | `de2c4966d7834a3810ff8368b4888b49bf673452b292c0490a7267749ff91da9` |

## Bundle checksums

| Bundle | SHA-256 |
|---|---|
| Kleenest_Updated_Everything_v9.zip | `524027289461f1e457bfdcbe23bd1e7f81af4cd08e5edd5119afbab9c6b35ea1` |
| Kleenest_Four_Seasons_Specific_Offer_v10.zip | `059d3089f8ad854de4a1cfdbd1ff6b8bb6ad5fcdb825c9175133596f1ef07506` |
| Kleenest_Four_Seasons_Custom_Value_Pack_v9.zip | `f6084c7cce978338453b968858faca9ce427a2015d4523b48d7416bb938ad88a` |
| Kleenest_Updated_Cortex_Four_Seasons_Materials_v8.zip | `30e3e369446278ce038a7821ca8a0cef19129337c823976e01456139ffb52be8` |
| Kleenest_Updated_Everything_v7.zip | `a446f6c58256991c590d45414770b06b31fa114e36f5024ae5074a6f88ce42c5` |
| Kleenest_Updated_Business_Plan_Financials_Outreach_v7.zip | `a50143351fb4d78b525fe5f0d445fd56fcf0a9dd28f0c0bd2fc1076c1d15448b` |
| Kleenest_Consumer_First_Meeting_Pack_v4.zip | `b3a5d0f06dc97c9f6063e1a295b7a14fdcfad597c5d3c7924f529441a8962045` |
| Kleenest_Upgraded_Target_Materials_Pack.zip | `323e1aabfd6f9b744389e53d17bb2e6af330c9563cf08bf65514b58e9837a53f` |
| Kleenest_Individual_Target_Packets.zip | `3c8713dba49b254dd7c25933c523c1d04bb921a48bfd26833253c2d3c10b5b91` |
| Kleenest_Outreach_Target_Materials.zip | `3d354d2dc47939966bdf3b166b323ec5723fc4e492cd49d67ba439e474e73758` |
| Kleenest_Skandalaris_Action_Pack.zip | `5252eabe9a15398709493a2d83cc5b2cba55e93215d53ae4137965abe6e48e40` |

## Binary handling

The public Git repository contains searchable normalized copies and manifests. Some original binaries remain in ChatGPT Library or Google Drive because the GitHub connector cannot accept those file references directly as binary uploads.

A file with a matching SHA-256 above is the exact audited source even if it is later moved between Library, Drive, local storage or Git.

## Security

Configuration/environment strings found in historical source material are intentionally excluded from the public normalized copies.
