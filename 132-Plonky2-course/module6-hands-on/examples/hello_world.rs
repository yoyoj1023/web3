//! Hello World Example for Plonky2
//! 
//! This is the simplest possible Plonky2 circuit that proves knowledge of a secret value.
//! The circuit constrains that a private input equals a public constant.

use anyhow::Result;
use plonky2::iop::witness::{PartialWitness, WitnessWrite};
use plonky2::plonk::circuit_builder::CircuitBuilder;
use plonky2::plonk::config::{GenericConfig, PoseidonGoldilocksConfig};

use plonky2_course_hands_on::{default_config, prove_and_verify, utils, F};

/// Configuration for our circuit
type Config = PoseidonGoldilocksConfig;
const D: usize = 2; // Extension degree

fn main() -> Result<()> {
    // Initialize logger
    env_logger::init();
    
    println!("🚀 Plonky2 Hello World Example");
    println!("===============================");
    
    // The secret value we want to prove knowledge of
    let secret_value = F::from_canonical_u64(42);
    
    // Build the circuit
    println!("\n📐 Building circuit...");
    let config = default_config();
    let mut builder = CircuitBuilder::<F, 2>::new(config);
    
    // Add a private input (witness)
    let secret_target = builder.add_virtual_target();
    
    // Add a public input  
    let public_target = builder.add_virtual_target();
    
    // Constraint: secret_target must equal public_target
    builder.connect(secret_target, public_target);
    
    // Register public input
    builder.register_public_input(public_target);
    
    // Build the circuit
    let circuit_data = builder.build::<Config>();
    
    // Print circuit statistics
    utils::print_circuit_stats(&circuit_data);
    
    // Create witness
    println!("\n🔍 Creating witness...");
    let mut pw = PartialWitness::new();
    pw.set_target(secret_target, secret_value);
    pw.set_target(public_target, secret_value); // Same value for public input
    
    // Public inputs for verification
    let public_inputs = vec![secret_value];
    
    // Generate and verify proof
    println!("\n⚡ Generating and verifying proof...");
    let _proof = prove_and_verify(&circuit_data, pw, public_inputs)?;
    
    println!("\n🎉 Success! We proved knowledge of the secret value 42!");
    
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_hello_world_circuit() -> Result<()> {
        let secret_value = F::from_canonical_u64(123);
        
        let config = default_config();
        let mut builder = CircuitBuilder::<F, 2>::new(config);
        
        let secret_target = builder.add_virtual_target();
        let public_target = builder.add_virtual_target();
        
        builder.connect(secret_target, public_target);
        builder.register_public_input(public_target);
        
        let circuit_data = builder.build::<Config>();
        
        let mut pw = PartialWitness::new();
        pw.set_target(secret_target, secret_value);
        pw.set_target(public_target, secret_value);
        
        let public_inputs = vec![secret_value];
        let _proof = prove_and_verify(&circuit_data, pw, public_inputs)?;
        
        Ok(())
    }
}