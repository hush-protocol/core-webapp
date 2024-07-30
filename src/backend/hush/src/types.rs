use candid::{CandidType, Deserialize,Nat,Principal};


#[derive(CandidType,Deserialize)]
pub struct CanisterSettings {
    pub controllers: Option<Vec<Principal>>,

    pub compute_allocation: Option<Nat>,

    pub memory_allocation: Option<Nat>,

    pub freezing_threshold: Option<Nat>,

    pub reserved_cycles_limit: Option<Nat>,
}

#[derive(CandidType,Deserialize)]
pub struct StorageCanisterInput{
    pub username: String,
}

#[derive(CandidType, Deserialize)]
pub struct CreateCanisterArgument {
    /// See [CanisterSettings].
    pub settings: Option<CanisterSettings>,
}
