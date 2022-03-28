import { action, autorun, makeAutoObservable } from "mobx";
import Web3 from "web3";
import { WalletLibrary } from "./interface/WalletLibrary";

export class MetaMaskStore implements WalletLibrary {
  private web3: Web3 | null = null;
  active: boolean = false;
  address: string = "";
  balance: string = "0";

  constructor() {
    makeAutoObservable(this);

    if (typeof window.ethereum === "undefined") {
      alert("Metamask가 필요합니다.");
      window.open("https://metamask.io/download.html");
      return;
    }

    try {
      this.web3 = new Web3(window.ethereum);

      window.ethereum.request({ method: "eth_requestAccounts" }).then(
        action((accounts: string[]) => {
          this.address = accounts[0];
          this.active = true;
        })
      );

      window.ethereum.on(
        "accountsChanged",
        action((accounts: string[]) => {
          this.address = accounts[0];
          console.log("address changed to: ", this.address);
        })
      );
      window.ethereum.on(
        "chainChanged",
        action((_chainId: string) => {
          console.log("network changed to: ", _chainId);
          this.refetchBalance();
        })
      );
    } catch (e) {
      alert("Metamask 연결 중 실패");
    }

    autorun(() => this.refetchBalance());
  }

  refetchBalance() {
    this.getBalanceOf(this.address).then(
      action((balance: string | undefined) => {
        this.balance = balance || "0";
      })
    );
  }

  async getBalanceOf(address: string) {
    if (!this.web3 || !this.web3.utils.isAddress(address)) return;

    try {
      const balance = await this.web3.eth.getBalance(address);
      if (Number(balance) < 0) {
        console.log("잔액을 가져오는 중 에러 발생.");
      }

      return this.web3.utils.fromWei(balance, "ether");
    } catch (e) {
      console.log(e);
    }
  }
}
