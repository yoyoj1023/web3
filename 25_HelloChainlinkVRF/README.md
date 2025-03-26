# My Hardhat App

This project is a Hardhat application that demonstrates how to interact with the Chainlink VRF (Verifiable Random Function) to request random numbers on the Ethereum blockchain.

## Project Structure

```
my-hardhat-app
├── contracts
│   └── RandomNumberConsumer.sol
├── scripts
│   └── interact.js
├── test
│   └── RandomNumberConsumer.test.js
├── package.json
├── hardhat.config.js
└── README.md
```

## Contracts

### `RandomNumberConsumer.sol`

This contract interacts with Chainlink VRF to request random numbers. It includes the following functionalities:
- Requesting random numbers
- Handling the callback with the generated random number
- Retrieving the random number based on the request ID

## Scripts

### `interact.js`

This script uses Ethers.js to interact with the `RandomNumberConsumer` contract. It includes functionality to:
- Deploy the contract
- Request a random number
- Retrieve the generated random number

## Tests

### `RandomNumberConsumer.test.js`

This file contains tests for the `RandomNumberConsumer` contract. It verifies the functionality of:
- Requesting random numbers
- Retrieving the generated random numbers

## Installation

To get started with this project, follow these steps:

1. Clone the repository:
   ```
   git clone <repository-url>
   cd my-hardhat-app
   ```

2. Install the dependencies:
   ```
   npm install
   ```

3. Configure your environment variables (if necessary).

## Usage

To deploy the contract and interact with it, run the following command:
```
npx hardhat run scripts/interact.js --network <network-name>
```

Replace `<network-name>` with the desired network (e.g., `rinkeby`, `mainnet`, etc.).

## Running Tests

To run the tests for the `RandomNumberConsumer` contract, use the following command:
```
npx hardhat test
```

## License

This project is licensed under the MIT License.