import React, { ChangeEventHandler, useState, forwardRef } from "react";
import Head from "next/head";
// import Image from "next/image";
// import { Inter } from "next/font/google";
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

const Textarea = forwardRef((props) => (
  <Input rows={5} {...props} as="textarea" className={styles.textarea} />
));

// const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [fact, setFact] = useState("");
  const [appeal, setAppeal] = useState("");
  const [indictment, setIndictment] = useState("");
  const [loading, setLoading] = useState(false);
  const toaster = useToaster();

  const MyMessage = (content: string, type: TypeAttributes.Status) => {
    return (
      <Message showIcon type={type}>
        {content}
      </Message>
    );
  };

  const generateIndictment = () => {
    setLoading(true);
    if (!fact || !appeal) {
      toaster.push(MyMessage("请输入‘事实经过’和‘诉求’！", "warning"), {
        placement: "topCenter",
        duration: 2000,
      });
      setLoading(false);
      return;
    }
    const body: GenerateIndictmentBody = {
      fact: fact,
      appeal: appeal,
    };
    fetch(`${window.location.href}api/generateIndictment`, {
      method: "post",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    })
      .then(async (res) => {
        try {
          const data = await res.json();
          setIndictment(data.text);
          setLoading(false);
        } catch {
          toaster.push(MyMessage("生成失败，请重试！", "error"), {
            placement: "topCenter",
            duration: 2000,
          });
          setLoading(false);
        }
      })
      .catch((err) => {
        toaster.push(MyMessage("生成失败，请重试！", "error"), {
          placement: "topCenter",
          duration: 2000,
        });
        setLoading(false);
      });
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
                onChange={factChange}
              />
            </Form.Group>
            <Form.Group controlId="textarea">
              <Form.ControlLabel>诉求：</Form.ControlLabel>
              <Form.Control
                name="textarea"
                accepter={Textarea}
                value={appeal}
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
