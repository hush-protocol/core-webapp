use serde::Deserialize;
use ark_bn254::{Bn254, Fq, Fq2, G1Affine, G2Affine, Fr}; use ark_groth16::VerifyingKey;
// For Bn254 curve types
use std::str::FromStr; // For string parsing
use ark_groth16::{prepare_verifying_key,Groth16,Proof};
use crate::constant::ZK_PROOF_PARAMS;

#[derive(Deserialize)]
struct JsonVerifyingKey {
    vk_alpha_1: Vec<String>,
    vk_beta_2: Vec<Vec<String>>,
    vk_gamma_2: Vec<Vec<String>>,
    vk_delta_2: Vec<Vec<String>>,
    ic: Vec<Vec<String>>,
}


#[derive(Deserialize)]
struct JsonProof {
    pi_a: Vec<String>,
    pi_b: Vec<Vec<String>>,
    pi_c: Vec<String>,
    // protocol and curve fields are not needed for the conversion
}





pub struct AadhaarVerifier;


fn convert_to_public_input(json_array: Vec<String>) -> Vec<Fr> {
    json_array
        .into_iter()
        .map(|s| Fr::from_str(&s).expect("Failed to parse"))
        .collect()
  }
  
  
  
  fn convert_to_verifying_key(json_vk: JsonVerifyingKey) -> VerifyingKey<Bn254> {
      let alpha_g1 = parse_g1(&json_vk.vk_alpha_1);
      let beta_g2 = parse_g2(&json_vk.vk_beta_2);
      let gamma_g2 = parse_g2(&json_vk.vk_gamma_2);
      let delta_g2 = parse_g2(&json_vk.vk_delta_2);
      let gamma_abc_g1 = json_vk
          .ic
          .iter()
          .map(|point| parse_g1(point))
          .collect();
      
      VerifyingKey {
          alpha_g1,
          beta_g2,
          gamma_g2,
          delta_g2,
          gamma_abc_g1,        
      }
  }
  
  fn parse_g1(coords: &[String]) -> G1Affine {
      let x = Fq::from_str(&coords[0]).unwrap();
      let y = Fq::from_str(&coords[1]).unwrap();
      G1Affine::new(x, y) // Updated to two arguments
  }
  
  fn parse_g2(coords: &[Vec<String>]) -> G2Affine {
      let x = Fq2::new(
          Fq::from_str(&coords[0][0]).unwrap(),
          Fq::from_str(&coords[0][1]).unwrap(),
      );
      let y = Fq2::new(
          Fq::from_str(&coords[1][0]).unwrap(),
          Fq::from_str(&coords[1][1]).unwrap(),
      );
      G2Affine::new(x, y) // Updated to two arguments
  }

impl AadhaarVerifier {
    fn verify(json_proof:&str,public_input_json:&str) -> bool{
        let json_vk: JsonVerifyingKey = serde_json::from_str(ZK_PROOF_PARAMS).expect("JSON was not well-formatted");
        let vk = convert_to_verifying_key(json_vk);
        let vk_prepared = prepare_verifying_key(&vk);
        let proof_data: JsonProof = serde_json::from_str(json_proof).expect("Proof JSON was not well-formatted");
        let pi_a = parse_g1(&proof_data.pi_a);
        let pi_b = parse_g2(&proof_data.pi_b);
        let pi_c = parse_g1(&proof_data.pi_c);
        let final_proof = Proof {
            a:pi_a,
            b: pi_b,
            c:pi_c
        };
        let parsed: Vec<String> = serde_json::from_str(public_input_json).expect("Error in array json");
        let public_input = convert_to_public_input(parsed);
        match Groth16::<Bn254>::verify_proof(&vk_prepared, &final_proof, &public_input) {
            Ok(valid) => {
              ic_cdk::println!("Proof is valid");
              ic_cdk::println!("{}", valid);
              return valid
            },
            Err(_) => 
            {
              ic_cdk::println!("Proof is invalid.");
              return false
            }
        };
        
    }   
}