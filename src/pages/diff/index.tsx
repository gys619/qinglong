import React, { PureComponent, Fragment, useState, useEffect } from 'react';
import { Button, notification, Modal } from 'antd';
import config from '@/utils/config';
import { PageContainer } from '@ant-design/pro-layout';
import { request } from '@/utils/http';
import ReactDiffViewer from 'react-diff-viewer';
import './index.less';

const Crontab = () => {
  const [width, setWdith] = useState('100%');
  const [marginLeft, setMarginLeft] = useState(0);
  const [marginTop, setMarginTop] = useState(-72);
  const [value, setValue] = useState('');
  const [sample, setSample] = useState('');
  const [loading, setLoading] = useState(true);

  const getConfig = () => {
    request.get(`${config.apiPrefix}config/config`).then((data) => {
      setValue(data.content);
    });
  };

  const getSample = () => {
    setLoading(true);
    request
      .get(`${config.apiPrefix}config/sample`)
      .then((data) => {
        setSample(data.content);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (document.body.clientWidth < 768) {
      setWdith('auto');
      setMarginLeft(0);
      setMarginTop(0);
    } else {
      setWdith('100%');
      setMarginLeft(0);
      setMarginTop(-72);
    }
    getConfig();
    getSample();
  }, []);

  return (
    <PageContainer
      className="code-mirror-wrapper"
      title="对比工具"
      loading={loading}
      header={{
        style: {
          padding: '4px 16px 4px 15px',
          position: 'sticky',
          top: 0,
          left: 0,
          zIndex: 20,
          marginTop,
          width,
          marginLeft,
        },
      }}
      style={{
        height: '100vh',
      }}
    >
      <ReactDiffViewer
        styles={{
          diffContainer: {
            overflowX: 'auto',
            minWidth: 768,
          },
          diffRemoved: {
            overflowX: 'auto',
            maxWidth: 300,
          },
          diffAdded: {
            overflowX: 'auto',
            maxWidth: 300,
          },
          line: {
            wordBreak: 'break-word',
          },
        }}
        oldValue={value}
        newValue={sample}
        splitView={true}
        leftTitle="config.sh"
        rightTitle="config.sh.sample"
        disableWordDiff={true}
      />
      {/* <CodeDiff
        style={{ height: 'calc(100vh - 72px)', overflowY: 'auto' }}
        outputFormat="side-by-side"
        oldStr={value}
        newStr={sample}
      /> */}
    </PageContainer>
  );
};

export default Crontab;
