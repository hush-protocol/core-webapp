
use ic_stable_structures::{memory_manager::{MemoryId, MemoryManager, VirtualMemory}, storable::Bound, DefaultMemoryImpl, StableBTreeMap, StableVec, Storable,StableCell};
use std::{borrow::{Borrow, BorrowMut, Cow}, cell::{Ref, RefCell}};
use candid::{CandidType, Decode, Deserialize, Encode, Principal};
type Memory = VirtualMemory<DefaultMemoryImpl>;



#[derive(Debug,CandidType,Deserialize,Clone)]
pub struct SecretStorage {
    pub secret : String,
    pub recovery_storage_canisters:  Vec<Principal>
}
impl Storable for SecretStorage {
    fn to_bytes(&self) -> std::borrow::Cow<[u8]> {
        Cow::Owned(Encode!(&self).unwrap())
    }
    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(),Self).unwrap()
    }
    const BOUND : Bound = Bound::Unbounded;
}
thread_local! {

    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> =
        RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));

    static SECRETS: RefCell<StableVec<SecretStorage, Memory>> = RefCell::new(
        StableVec::new(MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(0)))).unwrap()
    );
    static USERNAME: RefCell<StableCell<String,Memory>> = RefCell::new(
        StableCell::init(MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(1))),"".to_string()).unwrap()
    );
}
pub struct SecretStorageState;

impl SecretStorageState {
    pub fn get_secrets() -> Vec<SecretStorage> {
        SECRETS.with(|state| {
            state.borrow().iter().collect()
        })
    }
    pub fn get_secret(index: u64) -> Option<SecretStorage> {
        SECRETS.with(|state| {
            state.borrow().get(index).clone()
        })
    }
    pub fn add_secret(secret: SecretStorage) {
        SECRETS.with(|state| {
            state.borrow_mut().push(secret.borrow());
        });
    }

    pub fn add_recovery_storage_canister(index: u64, value: Principal) {
        SECRETS.with(|state| {
            let mut secret = state.borrow().get(index).unwrap();
            secret.recovery_storage_canisters.push(value);
            state.borrow_mut().set(index, secret.borrow());
        });
    }

    pub fn get_username() -> String {
        USERNAME.with(|state| {
            state.borrow().get().clone()
        })
    }

    pub fn set_username(username: String) {
        USERNAME.with(|state| {
            state.borrow_mut().set(username);
        });
    }


}