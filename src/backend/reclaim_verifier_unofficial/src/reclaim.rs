use candid::CandidType;
use ic_stable_structures::{Storable};
use k256::ecdsa::{Signature, VerifyingKey};
use serde::Deserialize;
use sha2::Sha256;
use sha3::{Digest, Keccak256};
use ecdsa::RecoveryId;

use crate::{identity_digest::Identity256, state::{Epoch, Witness}};




fn generate_random_seed(bytes: Vec<u8>, offset: usize) -> u32 {
    let hash_slice = &bytes[offset..offset + 4];
    let mut seed = 0u32;
    for (i, &byte) in hash_slice.iter().enumerate() {
        seed |= u32::from(byte) << (i * 8);
    }
    seed
}




#[derive(Debug, Clone, PartialEq, Eq,CandidType,Deserialize)]
pub struct ClaimInfo {
    pub provider: String,
    pub parameters: String,
    pub context: String,
}

impl ClaimInfo {
    pub fn hash(&self) -> String {
        let mut hasher = Keccak256::new();
        let hash_str = format!(
            "{}\n{}\n{}",
            &self.provider, &self.parameters, &self.context
        );
        hasher.update(&hash_str);

        let hash = hasher.finalize().to_vec();
        append_0x(hex::encode(hash).as_str())
    }
}

#[derive(Debug, Clone, PartialEq, Eq,CandidType,Deserialize)]
pub struct CompleteClaimData {
    pub identifier: String,
    pub owner: String,
    pub epoch: u64,
    pub timestampS: u64,
}

impl CompleteClaimData {
    pub fn serialise(&self) -> String {
        format!(
            "{}\n{}\n{}\n{}",
            &self.identifier,
            &self.owner.to_string(),
            &self.timestampS.to_string(),
            &self.epoch.to_string()
        )
    }
}

#[derive(Debug, Clone, PartialEq, Eq,CandidType,Deserialize)]
pub struct SignedClaim {
    pub claim: CompleteClaimData,
    pub signatures: Vec<String>,
}


impl SignedClaim {
    pub fn recover_signers_of_signed_claim(self) -> Vec<String> {
        // use crate::claims::identity_digest::Identity256;
        use digest::Update;
        // Create empty array
        let mut expected = vec![];
        // Hash the signature
        let serialised_claim = self.claim.serialise();

        let bm = keccak256_eth(serialised_claim.as_str());
        let message_hash = bm.to_vec();

        // For each signature in the claim
        for mut complete_signature in self.signatures {
            complete_signature.remove(0);
            complete_signature.remove(0);
            let rec_param = complete_signature
                .get((complete_signature.len() - 2)..(complete_signature.len()))
                .unwrap();
            let mut mut_sig_str = complete_signature.clone();
            mut_sig_str.pop();
            mut_sig_str.pop();

            let rec_dec = hex::decode(rec_param).unwrap();
            let rec_norm = rec_dec.first().unwrap() - 27;
            let r_s = hex::decode(mut_sig_str).unwrap();

            let id = match rec_norm {
                0 => RecoveryId::new(false, false),
                1 => RecoveryId::new(true, false),
                2_u8..=u8::MAX => todo!(),
            };

            let signature = Signature::from_bytes(r_s.as_slice().into()).unwrap();
            let message_digest = Identity256::new().chain(&message_hash);

            // Recover the public key
            let verkey =
                VerifyingKey::recover_from_digest(message_digest, &signature, id).unwrap();
            let key: Vec<u8> = verkey.to_encoded_point(false).as_bytes().into();
            let hasher = Keccak256::new_with_prefix(&key[1..]);

            let hash = hasher.finalize().to_vec();

            let address_bytes = hash.get(12..).unwrap();
            let public_key = append_0x(&hex::encode(address_bytes));
            expected.push(public_key);
        }
        expected
    }

    pub fn fetch_witness_for_claim(
        epoch: Epoch,
        identifier: String,
        timestamp: u64,
    ) -> Vec<Witness> {
        let mut selected_witness = vec![];

        // Create a hash from identifier+epoch+minimum+timestamp
        let hash_str = format!(
            "{}\n{}\n{}\n{}",
            hex::encode(identifier),
            epoch.minimum_witness_for_claim_creation,
            timestamp,
            epoch.id
        );
        let result = hash_str.as_bytes().to_vec();
        let mut hasher = Sha256::new();
        hasher.update(result);
        let hash_result = hasher.finalize().to_vec();
        let witenesses_left_list = epoch.witness;
        let mut byte_offset = 0;
        let witness_left = witenesses_left_list.len();
        for _i in 0..epoch.minimum_witness_for_claim_creation {
            let random_seed = generate_random_seed(hash_result.clone(), byte_offset) as usize;
            let witness_index = random_seed % witness_left;
            let witness = witenesses_left_list.get(witness_index);
            if let Some(data) = witness {
                selected_witness.push(data.clone())
            }
            byte_offset = (byte_offset + 4) % hash_result.len();
        }

        selected_witness
    }
}


#[derive(Debug, PartialEq, Eq)]
pub struct Proof {
    pub claimInfo: ClaimInfo,
    pub signedClaim: SignedClaim,
}

pub fn append_0x(content: &str) -> String {
    let mut initializer = String::from("0x");
    initializer.push_str(content);
    initializer
}

pub fn keccak256_eth(message: &str) -> Vec<u8> {
    let message: &[u8] = message.as_ref();

    let mut eth_message =
        format!("\x19Ethereum Signed Message:\n{}", message.len()).into_bytes();
    eth_message.extend_from_slice(message);
    let mut hasher = Keccak256::new();
    hasher.update(&eth_message);

    hasher.finalize().to_vec()
}

#[derive(Debug, PartialEq, Eq)]
pub enum ReclaimError {
    OnlyOwner,
    AlreadyInitialized,
    HashMismatch,
    LengthMismatch,
    SignatureMismatch,
}
