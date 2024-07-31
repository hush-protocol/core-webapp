use ic_cdk::api::management_canister::http_request::http_request;
use ic_cdk::api::management_canister::http_request::{HttpResponse, TransformArgs, HttpHeader, CanisterHttpRequestArgument, HttpMethod, TransformContext, TransformFunc, self};
// use storage::read_recovery_storage_canister;
use util::EmailMessage;
use ic_cdk::api::call::RejectionCode;
use regex::Regex;
use resolver::Resolver;
use viadkim::{signature, VerificationResult, VerificationStatus, Verifier};

use std::borrow::Borrow;
use std::cell::RefCell;
use std::collections::HashMap;
use std::time::{SystemTime, UNIX_EPOCH, Duration};
// use std::{error::Error, fs, io};
use serde::{Serialize, Deserialize};
use viadkim;
mod resolver;
mod types;
mod storage;
mod util;


#[ic_cdk::query]
fn transform(response: TransformArgs) -> HttpResponse {
    let mut t = response.response;
    t.headers = vec![];
    t 
}

#[ic_cdk::update]
async fn get_dkim(name:String)->String {
    let url  = format!("https://dns.google.com/resolve?name={}&type=TXT",name);
    let request_header = vec![
        HttpHeader{
            name:"Accept".to_string(),
            value:"*/*".to_string()
        }
    ];
    let request = CanisterHttpRequestArgument{
        url:url.to_string(),
        method:HttpMethod::GET,
        body:None,
        max_response_bytes:None,
        transform:Some(
            TransformContext{
                function:TransformFunc(candid::Func { principal: ic_cdk::api::id(), method: "transform".to_string() }),
                context:vec![]
            }
        ),
        headers:request_header
    };

    match http_request(request,230_949_972_000).await {
        Ok((response,))=>{
            let str_body=String::from_utf8(response.body).expect("Transformed response is not UTF-8 encoded.");
            str_body
        },
        Err(err) => {
            ic_cdk::println!("print ln {:?}",err.0);
            ic_cdk::println!("printllnnasdfds {:?}",err.1);
            "".to_string()
        }, 
    }
} 

#[ic_cdk::update]
async fn verify(args: String,storage_index: u64) -> Result<bool, String> {
    let resolver = resolver::Resolver::new(|name|{
        Box::pin(async move {
        ic_cdk::println!("name: {}",name);
        let dns_string = get_dkim(name.to_string()).await;
        ic_cdk::println!("dns_string: {}",dns_string);
        let dns_response: types::DnsQueryResponse = serde_json::from_str(&dns_string).unwrap();
        let final_response: &String = &dns_response.Answer[0].data;
        return Ok(vec![Ok(format!("{final_response}").into())])
        }) 
    });
    let email_message: Result<EmailMessage, String> = util::parse_message(&args).map(|m| m)
        .map_err(|e| format!("Error parsing message: {}", e));

    let EmailMessage { body_string: body, header_fields: headers, header_string} = email_message.unwrap();

    let time_string = &ic_cdk::api::time().to_string()[..10];

    let time :u64= time_string.parse().unwrap(); 

    let config = viadkim::Config {
        fixed_system_time: Some(UNIX_EPOCH + Duration::from_secs(time)),
        allow_expired: true, 
        ..Default::default()

    };

    let mut verifier = match Verifier::verify_header(&resolver, &headers, &config).await {
        Some(verifier) => verifier,
        None => {
        ic_cdk::println!("No signatures in input message");
            return Err("No signatures in input message".to_string());
        }
    };

    let _ = verifier.process_body_chunk(body.as_bytes());

    let sigs = verifier.finish();

    let selected_headers = headers.into_iter().filter(|(key,_)| key.to_string() == "To" || key.to_string() == "Subject").collect::<Vec<_>>();

    let signature = sigs.into_iter().next().unwrap();


    match signature.status {
        VerificationStatus::Success => {
            let storage_canister = ic_cdk::caller();
            
            ic_cdk::println!("Signature verified successfully");
            let  current_storage = storage::read_recovery_storage_canister(storage_canister).await.unwrap();
            let to_header =format!("{:?}", selected_headers[1].1);
            let email = util::extract_email(&to_header).unwrap();
            if current_storage.storage_id_to_email.contains_key(&storage_index){
                let email_from_storage = current_storage.storage_id_to_email.get(&storage_index).unwrap().to_string();
                if(email == email_from_storage){
                    Ok(true)
                }
                else{
                    Ok(false)
                }
            }
            else {
                let mut new_storage = current_storage.to_owned();
                new_storage.storage_id_to_email.insert(storage_index,email); 
                
                storage::write_recovery_storage_canister(storage_canister, new_storage).await.unwrap();
                Ok(true)
            }
      
        }
        VerificationStatus::Failure(err) => {
            ic_cdk::println!("Signature verification failed");
            Err(format!("Signature verification failed: {:?}", err))
        }
    }

}


ic_cdk::export_candid!();