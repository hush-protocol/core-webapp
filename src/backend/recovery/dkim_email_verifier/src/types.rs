use serde::{Serialize, Deserialize};
use candid::{CandidType};
#[derive(Serialize, CandidType)]
pub enum DkimStatus {
    Success,
    Failure
}

#[derive(Serialize, Deserialize)]
pub struct DnsQueryResponse {
    pub Status: i32,
    pub TC: bool,
    pub RD: bool,
    pub RA: bool,
    pub AD: bool,
    pub CD: bool,
    pub Question: Vec<DnsQuestion>,
    pub Answer: Vec<DnsAnswer>,
    pub Comment: Option<String>,
}

#[derive(Serialize, Deserialize)]
pub struct DnsQuestion {
   pub name: String,
    #[serde(rename = "type")]
   pub type_: i32,
}

#[derive(Serialize, Deserialize)]
pub struct DnsAnswer {
    pub name: String,
    #[serde(rename = "type")]
    pub type_: i32,
    pub TTL: i32,
    pub data: String,
}



#[derive(CandidType)]
pub struct DkimVerification {
    pub status: DkimStatus,
    pub to: String,
    pub subject: String
}

#[derive(CandidType,Serialize,Deserialize,Clone)]
pub struct DkimEmailStorageState {
    pub storage_id_to_email: std::collections::BTreeMap<u64, String>,
}
