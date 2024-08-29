import { AnonAadhaarProof, LogInWithAnonAadhaar, useAnonAadhaar, useProver } from "@anon-aadhaar/react";
import { useEffect } from "react";

export default function AadharZkForm({
    output,
    setOutput,
  }: {
    output: string;
    setOutput: (newOutput: string) => void;
}) {
    const [anonAadhaar] = useAnonAadhaar();
    const [, latestProof] = useProver();
    
    useEffect(()=>{
        if(latestProof){
            const json_proof = JSON.stringify({
                pi_a:latestProof.proof.groth16Proof.pi_a,
                pi_b:latestProof.proof.groth16Proof.pi_b,
                pi_c:latestProof.proof.groth16Proof.pi_c
            })
            const public_input_json = JSON.stringify([
                latestProof.proof.pubkeyHash,
                latestProof.proof.nullifier,
                latestProof.proof.timestamp,
                latestProof.proof.ageAbove18,
                latestProof.proof.gender,
                latestProof.proof.pincode,
                latestProof.proof.state,
                latestProof.proof.nullifierSeed,
                latestProof.proof.signalHash
            ])
            setOutput(
                JSON.stringify({
                    json_proof:json_proof,
                    public_input_json:public_input_json,
                })
            )
        }

    },[latestProof])
    return (
        <>
        <div>
          <LogInWithAnonAadhaar nullifierSeed={601012485114177242178220141915023351103156} signal="username" />
          <p>{anonAadhaar?.status}</p>
        </div>
        <div >
          {/* Render the proof if generated and valid */}
          {anonAadhaar?.status === "logged-in" && (
            <>
              <p>✅ Proof is valid</p>
           
            </>
            )}
        </div>
        </>
      );
}