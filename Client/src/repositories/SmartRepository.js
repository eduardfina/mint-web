const { ethers, ContractFactory, BigNumber } = require("ethers");

let provider = null;
let signer = null;
let accounts = null;
let accountsResolve, accountsReject;
try {
  provider = new ethers.providers.Web3Provider(window.ethereum, 5);
  signer = provider.getSigner();
  provider.send("eth_requestAccounts", []).then((acc) => {
    accounts = acc;
    accountsResolve();
  }).catch((e) => {
    accountsReject(e);
  })
}catch (e) {
  console.log('-----------------------------------------------------------------------------------');
  console.log('Metamask not detected!');
  console.log('-----------------------------------------------------------------------------------');
}

export default {
  async signMessage(msg){
    return await signer.signMessage(msg);
  },
  async whatEthAccounts(){
    if(!accounts) {
      await new Promise(function (resolve, reject) {
        accountsResolve = resolve;
        accountsReject = reject;
      });
    }
  },
  async getMyAddress() {
    await this.whatEthAccounts();
    return await signer.getAddress();
  },
  parseEther(value){
    return ethers.utils.parseEther(value.toString());
  },
  decodeEther(value){
    return parseFloat(value) / (10 ** 18);
  },
  getBalanceOf(address){
    return provider.getBalance(address);
  },
  async deploy(contractData,args){
    const factory = new ContractFactory(contractData.abi, contractData.bytecode, signer);
    const tx= await factory.deploy(...args);
    return await tx.deployTransaction.wait()
  },
  call(contractInfo, functionContract, args){
    const contract = new ethers.Contract(contractInfo.address, contractInfo.abi, provider);
    return contract[functionContract].apply(null, args);
  },
  async transaction(contractData,functionName,args, value = 0){
    if(value > 0) {
      const overrides = {
        value: ethers.utils.parseEther(value.toString())
      };
      args.push(overrides)
    }
    let contract = new ethers.Contract(contractData.address, contractData.abi, signer);
    let tx = await contract[functionName].apply(null, args);
    return await tx.wait();
  },
  async sendETH(quantity,to) {
    return await signer.sendTransaction({to: to, value: ethers.utils.parseEther(quantity.toString())});
  },
};
