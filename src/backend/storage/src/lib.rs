use ic_cdk::{self, query};
mod state;
mod constant;
mod types;
mod cryptography;
#[query]
fn greet(name: String) -> String {
    format!("Hello, {}!", name)
}
