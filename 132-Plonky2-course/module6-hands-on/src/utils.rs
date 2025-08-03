//! Utility functions for the course examples

use plonky2::field::types::Field;
use plonky2::hash::poseidon::PoseidonHash;
use plonky2::iop::target::Target;
use plonky2::plonk::circuit_builder::CircuitBuilder;
use plonky2::plonk::config::Hasher;

use crate::{Config, F};

/// Hash two field elements using Poseidon
pub fn hash_two_field_elements(a: F, b: F) -> F {
    PoseidonHash::hash_no_pad(&[a, b])
}

/// Add a Poseidon hash constraint to the circuit
pub fn add_poseidon_hash_constraint(
    builder: &mut CircuitBuilder<F, 2>,
    left: Target,
    right: Target,
) -> Target {
    builder.hash_n_to_1_no_pad::<PoseidonHash>(&[left, right])
}

/// Convert a u64 to a field element
pub fn u64_to_field(value: u64) -> F {
    F::from_canonical_u64(value)
}

/// Convert a field element to u64 (for small values)
pub fn field_to_u64(field: F) -> u64 {
    field.to_canonical_u64()
}

/// Generate a vector of consecutive field elements
pub fn generate_consecutive_fields(start: u64, count: usize) -> Vec<F> {
    (start..start + count as u64)
        .map(u64_to_field)
        .collect()
}

/// Print circuit statistics
pub fn print_circuit_stats<const D: usize>(
    circuit_data: &plonky2::plonk::circuit_data::CircuitData<F, Config, D>
) {
    println!("Circuit Statistics:");
    println!("  Gates: {}", circuit_data.common.gates.len());
    println!("  Degree: {}", circuit_data.common.degree());
    println!("  Quotient degree factor: {}", circuit_data.common.quotient_degree_factor);
    println!("  FRI config: {:?}", circuit_data.common.fri_config);
}