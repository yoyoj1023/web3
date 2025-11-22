import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("MaliciousEngineModule", (m) => {
  // 部署 MaliciousEngine 合約
  const maliciousEngine = m.contract("MaliciousEngine");

  return { maliciousEngine };
});

