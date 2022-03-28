import Caver from "caver-js";
import { action, autorun, makeAutoObservable } from "mobx";
import { WalletLibrary } from "./interface/WalletLibrary";

export class KaikasStore implements WalletLibrary {
  private caver: Caver | null = null;
  active: boolean = false;
  balance: string = "0";
  address: string = "";

  constructor() {
    makeAutoObservable(this);

    if (typeof window.klaytn === "undefined") {
      alert("Kaikas 지갑이 필요합니다.");
      window.open(
        "https://chrome.google.com/webstore/detail/kaikas/jblndlipeogpafnldhgmapagcccfchpi"
      );
      return;
    }

    try {
      this.caver = new Caver(window.klaytn);

      window.klaytn.enable().then(
        action((accounts: string[]) => {
          this.address = accounts[0];
          this.active = true;
        })
      );
      window.klaytn.on(
        "accountsChanged",
        action((accounts: string[]) => {
          this.address = accounts[0];
          console.log("address changed to: ", this.address);
        })
      );
      window.klaytn.on(
        "networkChanged",
        action((networkId: string) => {
          console.log("network changed to: ", networkId);
          this.refetchBalance();
        })
      );
    } catch (e) {
      alert("Kaikas 연결 중 실패");
    }

    autorun(() => this.refetchBalance());
  }

  refetchBalance() {
    this.getBalanceOf(this.address).then(
      action((newBalance: string | undefined) => {
        this.balance = newBalance || "0";
      })
    );
  }

  async getBalanceOf(address: string) {
    if (!this.caver || !this.caver.utils.isAddress(address)) return;

    try {
      const newBalance = await this.caver.klay.getBalance(address);
      if (Number(newBalance) < 0) {
        console.log("잔액 정보를 가져오는 중 에러 발생");
      }

      return this.caver.utils.fromPeb(newBalance, "KLAY");
    } catch (e) {
      console.log(e);
    }
  }
}
