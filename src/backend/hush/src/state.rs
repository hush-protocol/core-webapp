

use ic_stable_structures::{memory_manager::{MemoryId, MemoryManager, VirtualMemory}, DefaultMemoryImpl, StableBTreeMap, StableVec};
use std::{borrow::{Borrow, BorrowMut}, cell::RefCell};
use candid::Principal;




type Memory = VirtualMemory<DefaultMemoryImpl>;



// pub struct HushProtocolState {
//     pub username_to_storage_canister: StableBTreeMap<String, Principal, Memory>,
//     pub recovery_storage_canisters:  StableVec<Principal,Memory>
// }


thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> =
        RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));

    static USERNAME_TO_STORAGE_CANISTER : RefCell<StableBTreeMap<String, Principal, Memory>> = RefCell::new(StableBTreeMap::init(
        MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(0)))
    ));

    static RECOVERY_STORAGE_CANISTERS: RefCell<StableVec<Principal,Memory>> = RefCell::new(
       StableVec::new(MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(1)))).unwrap()
    );
}


pub struct  HushProtocolState;

impl HushProtocolState {
    pub fn insert_username_to_storage_canister(key: String, value: Principal) {
        USERNAME_TO_STORAGE_CANISTER.with(|state| {
            state.borrow_mut().insert(key, value);
        });
    }
    pub fn add_recovery_storage_canister(value: Principal) {
        RECOVERY_STORAGE_CANISTERS.with(|state| {
            state.borrow_mut().push(value.borrow());
        });
    }

    pub fn does_username_exist(key: &String) -> bool {
        USERNAME_TO_STORAGE_CANISTER.with(|state| {
            state.borrow().contains_key(key)
        })
    }

    pub fn get_storage_canister_from_username(key: &String) -> Option<Principal> {
        USERNAME_TO_STORAGE_CANISTER.with(|state| {
            state.borrow().get(key).clone()
        })
    }

    pub fn get_recovery_storage_principal(index: u64) -> Option<Principal> {
        RECOVERY_STORAGE_CANISTERS.with(|state| {
            state.borrow().get(index).clone()
        })
    }

    pub fn get_all_recovery_canisters() -> Vec<Principal> {
        
        RECOVERY_STORAGE_CANISTERS.with(|state| {
            if(state.borrow().is_empty()) {
                return vec![];
            }
            state.borrow().iter().collect()
        })
        
    }
}