//! Square Root Example for Plonky2
//! 
//! This example demonstrates how to prove knowledge of a square root.
//! Given a public value y, we prove that we know a secret value x such that x² = y.

use anyhow::Result;
use plonky2::iop::witness::{PartialWitness, WitnessWrite};
use plonky2::plonk::circuit_builder::CircuitBuilder;
use plonky2::plonk::config::{GenericConfig, PoseidonGoldilocksConfig};

use plonky2_course_hands_on::{default_config, prove_and_verify, utils, F};

type Config = PoseidonGoldilocksConfig;
const D: usize = 2;

fn main() -> Result<()> {
    env_logger::init();
    
    println!("🔢 Plonky2 Square Root Example");
    println!("===============================");
    
    // The secret square root we want to prove knowledge of
    let secret_x = F::from_canonical_u64(7);
    let public_y = secret_x * secret_x; // y = x² = 49
    
    println!("🔐 Secret value x: {}", utils::field_to_u64(secret_x));
    println!("🌐 Public value y: {}", utils::field_to_u64(public_y));
    println!("💡 We will prove that x² = y without revealing x");
    
    // Build the circuit
    println!("\n📐 Building square root circuit...");
    let config = default_config();
    let mut builder = CircuitBuilder::<F, 2>::new(config);
    
    // Add private input for the square root
    let x_target = builder.add_virtual_target();
    
    // Add public input for the squared value
    let y_target = builder.add_virtual_target();
    
    // Compute x² using multiplication gate
    let x_squared = builder.mul(x_target, x_target);
    
    // Constraint: x² must equal y
    builder.connect(x_squared, y_target);
    
    // Register public input
    builder.register_public_input(y_target);
    
    // Build the circuit
    let circuit_data = builder.build::<Config>();
    
    // Print circuit statistics
    utils::print_circuit_stats(&circuit_data);
    
    // Create witness
    println!("\n🔍 Creating witness...");
    let mut pw = PartialWitness::new();
    pw.set_target(x_target, secret_x);
    pw.set_target(y_target, public_y);
    
    // Public inputs for verification
    let public_inputs = vec![public_y];
    
    // Generate and verify proof
    println!("\n⚡ Generating and verifying proof...");
    let _proof = prove_and_verify(&circuit_data, pw, public_inputs)?;
    
    println!("\n🎉 Success! We proved that we know the square root of {} without revealing it!", 
             utils::field_to_u64(public_y));
    
    Ok(())
}

/// Example with a different square root to show the flexibility
fn example_with_different_value() -> Result<()> {
    println!("\n🔄 Running example with different value...");
    
    let secret_x = F::from_canonical_u64(13);
    let public_y = secret_x * secret_x; // y = 169
    
    let config = default_config();
    let mut builder = CircuitBuilder::<F, 2>::new(config);
    
    let x_target = builder.add_virtual_target();
    let y_target = builder.add_virtual_target();
    let x_squared = builder.mul(x_target, x_target);
    
    builder.connect(x_squared, y_target);
    builder.register_public_input(y_target);
    
    let circuit_data = builder.build::<Config>();
    
    let mut pw = PartialWitness::new();
    pw.set_target(x_target, secret_x);
    pw.set_target(y_target, public_y);
    
    let public_inputs = vec![public_y];
    let _proof = prove_and_verify(&circuit_data, pw, public_inputs)?;
    
    println!("✅ Successfully proved square root of {}", utils::field_to_u64(public_y));
    
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_square_root_circuit() -> Result<()> {
        let secret_x = F::from_canonical_u64(5);
        let public_y = secret_x * secret_x;
        
        let config = default_config();
        let mut builder = CircuitBuilder::<F, 2>::new(config);
        
        let x_target = builder.add_virtual_target();
        let y_target = builder.add_virtual_target();
        let x_squared = builder.mul(x_target, x_target);
        
        builder.connect(x_squared, y_target);
        builder.register_public_input(y_target);
        
        let circuit_data = builder.build::<Config>();
        
        let mut pw = PartialWitness::new();
        pw.set_target(x_target, secret_x);
        pw.set_target(y_target, public_y);
        
        let public_inputs = vec![public_y];
        let _proof = prove_and_verify(&circuit_data, pw, public_inputs)?;
        
        Ok(())
    }
    
    #[test]
    fn test_multiple_square_roots() -> Result<()> {
        for x_val in [2, 3, 4, 5, 10, 15, 20] {
            let secret_x = F::from_canonical_u64(x_val);
            let public_y = secret_x * secret_x;
            
            let config = default_config();
            let mut builder = CircuitBuilder::<F, 2>::new(config);
            
            let x_target = builder.add_virtual_target();
            let y_target = builder.add_virtual_target();
            let x_squared = builder.mul(x_target, x_target);
            
            builder.connect(x_squared, y_target);
            builder.register_public_input(y_target);
            
            let circuit_data = builder.build::<Config>();
            
            let mut pw = PartialWitness::new();
            pw.set_target(x_target, secret_x);
            pw.set_target(y_target, public_y);
            
            let public_inputs = vec![public_y];
            let _proof = prove_and_verify(&circuit_data, pw, public_inputs)?;
        }
        
        Ok(())
    }
}