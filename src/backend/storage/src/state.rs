
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
    static RECOVERY_CANISTERS_STORAGE_MAP: RefCell<StableBTreeMap<Principal, Vec<u8>, Memory>> = RefCell::new(
        StableBTreeMap::new(MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(2))))
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

    pub fn read_recovery_storage_canister_bytes(canister_id: Principal) -> Option<Vec<u8>> {
        RECOVERY_CANISTERS_STORAGE_MAP.with(|state| {
            state.borrow().get(&canister_id).clone()
        })
    }

    pub fn write_recovery_storage_canister_bytes(canister_id: Principal, bytes: Vec<u8>) {
        RECOVERY_CANISTERS_STORAGE_MAP.with(|state| {
            state.borrow_mut().insert(canister_id, bytes);
        });
    }

    pub fn clear_recovery_storage_canister_bytes(canister_id: Principal) {
        RECOVERY_CANISTERS_STORAGE_MAP.with(|state| {
            state.borrow_mut().remove(&canister_id);
        });
    }

    pub fn if_recovery_storage_canister_exists(canister_id: Principal) -> bool {
        RECOVERY_CANISTERS_STORAGE_MAP.with(|state| {
            state.borrow().contains_key(&canister_id)
        })
    }

    pub fn get_latest_secrets_index() -> u64 {
        SECRETS.with(|state| {
            state.borrow().len() as u64
        })
    }


}