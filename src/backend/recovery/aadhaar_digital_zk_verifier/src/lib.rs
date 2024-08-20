use serde::Deserialize;

mod zk;
mod constant;

#[derive(Deserialize)]
struct AadhaarArgs {
    json_proof: String,
    public_input_json:String
}



#[ic_cdk::update]
async fn verify(args: String,storage_index: u64) -> Result<bool, String> {
        let aadhaar_args: AadhaarArgs = serde_json::from_str(&args).unwrap();
        let result = zk::AadhaarVerifier::verify(&aadhaar_args.json_proof,&aadhaar_args.public_input_json);
        Ok(result)
}

ic_cdk::export_candid!();