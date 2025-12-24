use std::hash::poseidon::bn254::hash_1;
use std::hash::poseidon::bn254::hash_2;
////// Checkpoint 4 //////
use binary_merkle_root::binary_merkle_root;
use std::println;

fn main(
    // public inputs
    nullifier_hash: pub Field,
    // private inputs
    nullifier: Field,
    secret: Field,
    ////// Checkpoint 4 //////
    // public inputs
    root: pub Field,
    vote: pub bool,
    depth: pub u32,
    // private inputs
    index: Field,
    // max of 2^16 leaves --> 65536 leaves
    siblings: [Field; 16],
) {
    ////// Checkpoint 3 //////
    println("=== Checkpoint 3: Nullifier & Commitment ===");
    println(f"Input nullifier: {nullifier}");
    println(f"Input secret: {secret}");
    
    let computed_nullifier_hash: Field = hash_1([nullifier]);
    println(f"Computed nullifier_hash: {computed_nullifier_hash}");
    println(f"Public input nullifier_hash: {nullifier_hash}");
    assert(computed_nullifier_hash == nullifier_hash);
    println("✓ nullifier_hash verification passed!");

    let commitment: Field = hash_2([nullifier, secret]);
    println(f"Computed commitment: {commitment}");

    ////// Checkpoint 4 //////
    println("=== Checkpoint 4: Merkle Tree Verification ===");
    println(f"Leaf index: {index}");
    println(f"Tree depth: {depth}");
    
    let mut siblings_num = 0;
    for i in 0..siblings.len() {
        if siblings[i] != 0 {
            siblings_num += 1;
        }
    }
    println(f"Number of non-zero siblings: {siblings_num}");
    assert(depth <= siblings.len());

    let index_bits: [u1; 16] = index.to_le_bits();
    println(f"Index in bits: {index_bits}");

    let computed_root = binary_merkle_root(hash_2, commitment, siblings_num, index_bits, siblings);
    println(f"Computed Merkle root: {computed_root}");
    println(f"Public input root: {root}");
    
    assert(computed_root == root);
    println("✓ Merkle root verification passed!");

    // just vote binding, to prevent compiler warnings
    println("=== Vote Binding ===");
    println(f"Vote choice: {vote}");
    let vote_field = vote as Field;
    println(f"Converted to Field: {vote_field}");
    assert((vote_field * vote_field) == vote_field);
    println("✓ Vote value verification passed (0 or 1)");
    
    println("=== ALL VERIFICATIONS PASSED! Proof generation successful! ===");
}
