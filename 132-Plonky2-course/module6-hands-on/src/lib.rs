//! Plonky2 Course - Hands-on Module
//! 
//! This module contains practical examples and utilities for learning Plonky2.

pub mod utils;

use anyhow::Result;
use plonky2::field::types::Field;
use plonky2::iop::witness::{PartialWitness, WitnessWrite};
use plonky2::plonk::circuit_builder::CircuitBuilder;
use plonky2::plonk::circuit_data::{CircuitConfig, CircuitData};
use plonky2::plonk::config::{GenericConfig, PoseidonGoldilocksConfig};
use plonky2::plonk::proof::ProofWithPublicInputs;

/// The configuration we use for our circuits.
/// PoseidonGoldilocksConfig uses Goldilocks field and Poseidon hash.
pub type Config = PoseidonGoldilocksConfig;
pub type F = <Config as GenericConfig<2>>::F;

/// Default circuit configuration with reasonable parameters
pub fn default_config() -> CircuitConfig {
    CircuitConfig::standard_recursion_config()
}

/// Helper function to build, prove, and verify a simple circuit
pub fn prove_and_verify<const D: usize>(
    circuit_data: &CircuitData<F, Config, D>,
    witness: PartialWitness<F>,
    public_inputs: Vec<F>,
) -> Result<ProofWithPublicInputs<F, Config, D>> {
    println!("Generating proof...");
    let start = std::time::Instant::now();
    
    let proof = circuit_data.prove(witness)?;
    
    println!("Proof generated in {:?}", start.elapsed());
    println!("Proof size: {} bytes", proof.to_bytes().len());
    
    println!("Verifying proof...");
    let verify_start = std::time::Instant::now();
    
    circuit_data.verify(proof.clone())?;
    
    println!("Proof verified in {:?}", verify_start.elapsed());
    println!("✓ Proof is valid!");
    
    Ok(proof)
}