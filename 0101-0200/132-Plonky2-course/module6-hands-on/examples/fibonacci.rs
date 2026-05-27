//! Fibonacci Sequence Example for Plonky2
//! 
//! This example demonstrates how to prove the correct computation of the nth Fibonacci number.
//! We prove that we correctly computed F(n) = F(n-1) + F(n-2) for a given sequence.

use anyhow::Result;
use plonky2::iop::witness::{PartialWitness, WitnessWrite};
use plonky2::plonk::circuit_builder::CircuitBuilder;
use plonky2::plonk::config::{GenericConfig, PoseidonGoldilocksConfig};

use plonky2_course_hands_on::{default_config, prove_and_verify, utils, F};

type Config = PoseidonGoldilocksConfig;
const D: usize = 2;

fn main() -> Result<()> {
    env_logger::init();
    
    println!("🌀 Plonky2 Fibonacci Sequence Example");
    println!("=====================================");
    
    // Parameters for Fibonacci computation
    let n = 10; // Compute F(10)
    let expected_result = 55; // F(10) = 55
    
    println!("🎯 Computing F({}) = {}", n, expected_result);
    println!("📋 Sequence: F(0)=0, F(1)=1, F(2)=1, F(3)=2, ..., F(10)=55");
    
    // Build the circuit
    println!("\n📐 Building Fibonacci circuit...");
    let config = default_config();
    let mut builder = CircuitBuilder::<F, 2>::new(config);
    
    // Build Fibonacci circuit for n steps
    let result_target = build_fibonacci_circuit(&mut builder, n)?;
    
    // The result is our public input
    builder.register_public_input(result_target);
    
    let circuit_data = builder.build::<Config>();
    
    // Print circuit statistics
    utils::print_circuit_stats(&circuit_data);
    
    // Create witness by computing the actual Fibonacci sequence
    println!("\n🔍 Creating witness with Fibonacci computation...");
    let mut pw = PartialWitness::new();
    
    // We need to set the witness for the entire computation
    // This is handled internally by the circuit builder for the intermediate values
    pw.set_target(result_target, F::from_canonical_u64(expected_result));
    
    // Public inputs for verification
    let public_inputs = vec![F::from_canonical_u64(expected_result)];
    
    // Generate and verify proof
    println!("\n⚡ Generating and verifying proof...");
    let _proof = prove_and_verify(&circuit_data, pw, public_inputs)?;
    
    println!("\n🎉 Success! We proved the correct computation of F({}) = {}!", n, expected_result);
    
    Ok(())
}

/// Build a circuit that computes the nth Fibonacci number
fn build_fibonacci_circuit(
    builder: &mut CircuitBuilder<F, 2>,
    n: usize,
) -> Result<plonky2::iop::target::Target> {
    if n == 0 {
        return Ok(builder.zero());
    }
    if n == 1 {
        return Ok(builder.one());
    }
    
    // Initialize F(0) = 0 and F(1) = 1
    let mut prev_prev = builder.zero();
    let mut prev = builder.one();
    
    // Compute F(2) through F(n) iteratively
    for i in 2..=n {
        // F(i) = F(i-1) + F(i-2)
        let current = builder.add(prev, prev_prev);
        
        // Update for next iteration
        prev_prev = prev;
        prev = current;
        
        println!("  Added constraint for F({}) = F({}) + F({})", i, i-1, i-2);
    }
    
    Ok(prev)
}

/// Alternative implementation that stores all intermediate values
fn build_fibonacci_circuit_with_intermediates(
    builder: &mut CircuitBuilder<F, 2>,
    n: usize,
) -> Result<Vec<plonky2::iop::target::Target>> {
    let mut fib_values = Vec::new();
    
    if n >= 1 {
        fib_values.push(builder.zero()); // F(0) = 0
    }
    if n >= 2 {
        fib_values.push(builder.one()); // F(1) = 1
    }
    
    // Compute F(2) through F(n)
    for i in 2..=n {
        let current = builder.add(fib_values[i-1], fib_values[i-2]);
        fib_values.push(current);
    }
    
    Ok(fib_values)
}

/// Compute Fibonacci numbers natively for testing
fn compute_fibonacci_native(n: usize) -> u64 {
    if n == 0 { return 0; }
    if n == 1 { return 1; }
    
    let mut a = 0;
    let mut b = 1;
    
    for _ in 2..=n {
        let temp = a + b;
        a = b;
        b = temp;
    }
    
    b
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_fibonacci_native() {
        assert_eq!(compute_fibonacci_native(0), 0);
        assert_eq!(compute_fibonacci_native(1), 1);
        assert_eq!(compute_fibonacci_native(2), 1);
        assert_eq!(compute_fibonacci_native(3), 2);
        assert_eq!(compute_fibonacci_native(4), 3);
        assert_eq!(compute_fibonacci_native(5), 5);
        assert_eq!(compute_fibonacci_native(6), 8);
        assert_eq!(compute_fibonacci_native(7), 13);
        assert_eq!(compute_fibonacci_native(8), 21);
        assert_eq!(compute_fibonacci_native(9), 34);
        assert_eq!(compute_fibonacci_native(10), 55);
    }
    
    #[test]
    fn test_fibonacci_circuit_small() -> Result<()> {
        for n in 0..=5 {
            let expected = compute_fibonacci_native(n);
            
            let config = default_config();
            let mut builder = CircuitBuilder::<F, 2>::new(config);
            
            let result_target = build_fibonacci_circuit(&mut builder, n)?;
            builder.register_public_input(result_target);
            
            let circuit_data = builder.build::<Config>();
            
            let mut pw = PartialWitness::new();
            pw.set_target(result_target, F::from_canonical_u64(expected));
            
            let public_inputs = vec![F::from_canonical_u64(expected)];
            let _proof = prove_and_verify(&circuit_data, pw, public_inputs)?;
        }
        
        Ok(())
    }
    
    #[test]
    fn test_fibonacci_with_intermediates() -> Result<()> {
        let n = 7;
        let config = default_config();
        let mut builder = CircuitBuilder::<F, 2>::new(config);
        
        let fib_targets = build_fibonacci_circuit_with_intermediates(&mut builder, n)?;
        
        // Register all values as public inputs
        for target in &fib_targets {
            builder.register_public_input(*target);
        }
        
        let circuit_data = builder.build::<Config>();
        
        let mut pw = PartialWitness::new();
        let mut public_inputs = Vec::new();
        
        // Set witness for all Fibonacci values
        for (i, target) in fib_targets.iter().enumerate() {
            let value = compute_fibonacci_native(i);
            pw.set_target(*target, F::from_canonical_u64(value));
            public_inputs.push(F::from_canonical_u64(value));
        }
        
        let _proof = prove_and_verify(&circuit_data, pw, public_inputs)?;
        
        Ok(())
    }
}