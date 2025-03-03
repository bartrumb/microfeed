import React from "react";
import 'react-quill/dist/quill.snow.css';
import AdminRadio from "../AdminRadio";
import AdminTextarea from "../AdminTextarea";
import RichEditorQuill from "./component/RichEditorQuill";

interface AdminRichEditorProps {
  label?: string;
  value?: string;
  onChange: (value: string) => void;
  extra?: {
    publicBucketUrl?: string;
    folderName?: string;
  };
  labelComponent?: React.ReactNode;
}

interface AdminRichEditorState {
  mode: 'rich' | 'html';
  isOpenImage: boolean;
}

export default class AdminRichEditor extends React.Component<AdminRichEditorProps, AdminRichEditorState> {
  constructor(props: AdminRichEditorProps) {
    super(props);
    this.state = {
      mode: 'rich',
      isOpenImage: false,
    };
  }

  render() {
    const {mode} = this.state;
    const {label, value, onChange, extra, labelComponent} = this.props;

    return (
      <div>
        {label && <div className="lh-page-subtitle">
          {label}
        </div>}
        {labelComponent}
        <div className="mb-4 max-h-20">
          <AdminRadio
            groupName="richOrHtml"
            buttons={[
              {value: 'rich', name: 'visual editor', checked: mode === 'rich'},
              {value: 'html', name: 'html source', checked: mode !== 'rich'},
            ]}
            onChange={(e) => this.setState({mode: e.target.value as 'rich' | 'html'})}
            customClass="text-sm text-helper-color"
          />
        </div>
        {mode === 'rich' ? (
          <RichEditorQuill
            value={value}
            onChange={onChange}
            extra={extra}
          />
        ) : (
          <AdminTextarea 
            value={value || ''} 
            minRows={8} 
            maxRows={20} 
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)} 
            label=""
          />
        )}
      </div>
    );
  }
}

export type { AdminRichEditorProps };