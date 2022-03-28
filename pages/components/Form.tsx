import { observer } from "mobx-react-lite";

const Form = () => {
  return (
    <section>
      <h3>보내는 주소</h3>
      <input placeholder="address" onChange={(e) => {}}></input>
      <h3>Send Klay</h3>
      <input type={"number"} placeholder="klay" onChange={(e) => {}}></input>
      <button onClick={() => {}}>전송</button>
      <h3>Send Token</h3>
      <input type={"number"} placeholder="TTH1" onChange={(e) => {}}></input>
      <button onClick={() => {}}>전송</button>
    </section>
  );
};

export default observer(Form);
