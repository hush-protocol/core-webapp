use ic_stable_structures::{memory_manager::{MemoryId, MemoryManager, VirtualMemory}, storable::Bound, DefaultMemoryImpl, StableBTreeMap, StableCell, Storable};
use candid::{CandidType, Decode, Deserialize, Encode,Principal};
use std::{borrow::{Borrow, BorrowMut, Cow}, cell::RefCell};




type Memory = VirtualMemory<DefaultMemoryImpl>;

#[derive(Debug, Clone, PartialEq, Eq,CandidType,Deserialize)]
pub struct Witness {
    pub address: String,
    pub host: String,
}
impl Witness {
    pub fn get_addresses(witness: Vec<Witness>) -> Vec<String> {
        let mut vec_addresses = vec![];
        for wit in witness {
            vec_addresses.push(wit.address);
        }
        vec_addresses
    }
}




#[derive(Debug, PartialEq, Eq,CandidType,Deserialize)]
pub struct Epoch {
    pub id: u64,
    pub timestamp_start: u64,
    pub timestamp_end: u64,
    pub minimum_witness_for_claim_creation: u128,
    pub witness: Vec<Witness>,
}

impl  Storable for Epoch {
    fn to_bytes(&self) -> std::borrow::Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: std::borrow::Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }

    const BOUND : Bound = Bound::Unbounded;
}

thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> =
        RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));

    static OWNER : RefCell<StableCell<Principal,Memory>> = RefCell::new(StableCell::new(
        MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(0))),
        Principal::anonymous()
    ).unwrap());

    static CURRENT_EPOCH: RefCell<StableCell<u64,Memory>> = RefCell::new(StableCell::new(
        MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(1))),
        0
    ).unwrap());

    static EPOCHS: RefCell<StableBTreeMap<u64,Epoch,Memory>> = RefCell::new(
        StableBTreeMap::new(MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(2)))
    ));

}

pub struct  ReclaimProtocolState;

impl ReclaimProtocolState {
    pub fn add_witness_to_epoch(epoch_id: u64, witness: Witness) {
        EPOCHS.with(|state| {
            let mut epoch = state.borrow().get(epoch_id.borrow()).unwrap();
            epoch.witness.push(witness);
            state.borrow_mut().insert(epoch_id, epoch);
        });
        CURRENT_EPOCH.with(|state| {
            let _ = state.borrow_mut().set(state.borrow().get() + 1);
        }); 

    }

    pub fn add_epoch(epoch_id: u64,epoch:Epoch){
        EPOCHS.with(|state| {
            let _ = state.borrow_mut().insert(epoch_id, epoch);
        });
        CURRENT_EPOCH.with(|state| {
            let _ = state.borrow_mut().set(epoch_id);
        });
    }

    pub fn get_current_epoch() -> u64 {
        CURRENT_EPOCH.with(|state| {
            state.borrow().get().clone()
        })
    }

    pub fn get_epoch(epoch_id: u64) -> Option<Epoch> {
        EPOCHS.with(|state| {
            state.borrow().get(epoch_id.borrow())
        })
    }

    pub fn get_owner() -> Principal {
        OWNER.with(|state| {
            state.borrow().get().clone()
        })
    }

    pub fn set_owner(owner: Principal) {
        OWNER.with(|state| {
            let _ = state.borrow_mut().set(owner);
        });
    }


    


}
