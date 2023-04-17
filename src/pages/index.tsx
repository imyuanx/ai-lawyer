import { ChangeEventHandler, useState, forwardRef, useEffect } from "react";
import Head from "next/head";
import styles from "@/styles/Home.module.css";
import { GenerateIndictmentBody } from "./api/generateIndictment";
import {
  Button,
  ButtonToolbar,
  Form,
  Input,
  Message,
  useToaster,
  Footer,
} from "rsuite";
import { PrependParameters } from "rsuite/esm/@types/utils";
import { TypeAttributes } from "rsuite/esm/@types/common";
import * as ackeeTracker from "ackee-tracker";

const Textarea = forwardRef((props) => (
  <Input rows={5} {...props} as="textarea" className={styles.textarea} />
));

const FACT_PLACEHOLDER = `例：我与 xxx 在 2022 年 10 月签订一份为期一年的房屋租赁合同，其中我为租户、xxx 为中介，租金为 6300 元每月压一付一，2023 年 3 月 xxx 单方面解除合同，导致我无法继续居住并且拒绝退还押金，多次尝试联系 xxx 均未得到回应`;
const APPEAL_PLACEHOLDER = `例：要求 xxx 立即退还押金、利息，赔偿一个月租金等额违约金，赔偿误工费、律师费、诉讼费等费用`;

export default function Home() {
  const [fact, setFact] = useState("");
  const [appeal, setAppeal] = useState("");
  const [indictment, setIndictment] = useState("");
  const [loading, setLoading] = useState(false);
  const toaster = useToaster();
  const [ackeeServer, setAckeeServer] = useState("");
  const [ACKEE, setACKEE] = useState<ackeeTracker.AckeeInstance>();

  useEffect(() => {
    if (location.hostname === "ai-lawyer.yuanx.me") {
      const ackeeServer = "https://ackee.yuanx.me";
      setAckeeServer(ackeeServer);
      setACKEE(
        ackeeTracker.create(ackeeServer, {
          detailed: true,
          ignoreLocalhost: false,
        })
      );
    }
  }, []);

  const MyMessage = (content: string, type: TypeAttributes.Status) => {
    return (
      <Message showIcon type={type}>
        {content}
      </Message>
    );
  };

  const generateIndictment = async () => {
    ACKEE?.action("eb09d303-db45-40db-aefd-1183d951b2c0", {
      key: "Click",
      value: 1,
    });
    setLoading(true);
    if (!fact || !appeal) {
      toaster.push(MyMessage("请输入‘事实经过’和‘诉求’！", "warning"), {
        placement: "topCenter",
        duration: 2000,
      });
      setLoading(false);
      return;
    }
    console.log(fact, appeal);

    setIndictment("");
    const body: GenerateIndictmentBody = {
      fact: fact,
      appeal: appeal,
    };
    const res = await fetch(`${window.location.href}api/generateIndictment`, {
      method: "post",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });
    let error = "";
    if (res.ok) {
      try {
        const data = res.body;
        if (!data) {
          return;
        }
        const reader = data.getReader();
        const decoder = new TextDecoder();
        let chunkValues = "";
        while (true) {
          const { value, done } = await reader.read();
          const chunkValue = decoder.decode(value);
          chunkValues += chunkValue;
          setIndictment(chunkValues);
          if (done) {
            break;
          }
        }
      } catch (err) {
        error = "生成失败，请重试！";
      }
    } else {
      error = "生成失败，请重试！";
    }
    toaster.push(
      MyMessage(error || "生成完成，祝好", error ? "error" : "success"),
      {
        placement: "topCenter",
        duration: 2000,
      }
    );
    setLoading(false);
  };

  const cleanForm = () => {
    setFact("");
    setAppeal("");
  };

  const factChange: PrependParameters<
    ChangeEventHandler<HTMLInputElement>,
    [value: string]
  > = (value, e) => {
    setFact(value);
  };

  const appealChange: PrependParameters<
    ChangeEventHandler<HTMLInputElement>,
    [value: string]
  > = (value, e) => {
    setAppeal(value);
  };

  const indictmentChange: PrependParameters<
    ChangeEventHandler<HTMLInputElement>,
    [value: string]
  > = (value, e) => {
    setIndictment(value);
  };

  return (
    <>
      <Head>
        <title>AI 维权律师</title>
        <meta name="description" content="AI 维权律师" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        {ackeeServer && (
          <script
            async
            src={`${ackeeServer}/tracker.js`}
            data-ackee-server={ackeeServer}
            data-ackee-domain-id="7cff383e-2fdf-4191-94c1-58f4a0c2d7d7"
            data-ackee-opts='{ "detailed": true, "ignoreLocalhost": false }'
          ></script>
        )}
      </Head>
      <main className={styles.main}>
        <div className={styles.config}>
          <h1 className={styles.title}>AI 维权律师</h1>
          <Form fluid className={styles.form}>
            <Form.Group controlId="textarea">
              <Form.ControlLabel>事实经过：</Form.ControlLabel>
              <Form.Control
                name="textarea"
                accepter={Textarea}
                value={fact}
                placeholder={FACT_PLACEHOLDER}
                onChange={factChange}
              />
            </Form.Group>
            <Form.Group controlId="textarea">
              <Form.ControlLabel>诉求：</Form.ControlLabel>
              <Form.Control
                name="textarea"
                accepter={Textarea}
                value={appeal}
                placeholder={APPEAL_PLACEHOLDER}
                onChange={appealChange}
              />
            </Form.Group>
            <Form.Group>
              <ButtonToolbar>
                <Button
                  loading={loading}
                  appearance="primary"
                  onClick={generateIndictment}
                >
                  生成起诉书
                </Button>
                <Button appearance="default" onClick={cleanForm}>
                  清除数据
                </Button>
              </ButtonToolbar>
            </Form.Group>
            <Form.Group>
              <div className={styles.tips}>
                {
                  "小提示：尽量不要使用个人真实信息，可以使用 “x 先生 / 女士” 等方式代替"
                }
              </div>
            </Form.Group>
          </Form>
        </div>
        <div className={styles.output}>
          <Input
            as="textarea"
            placeholder="等待生成起诉书..."
            value={indictment}
            onChange={indictmentChange}
          />
        </div>
        <Footer className={styles.footer}>
          {"yuanx @ "}
          <a href="https://github.com/imyuanx" target="_blank">
            GitHub
          </a>
          {" | "}
          <a href="https://twitter.com/imyuanx" target="_blank">
            Twitter
          </a>
        </Footer>
      </main>
    </>
  );
}
