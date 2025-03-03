import React, { useState, useRef, useImperativeHandle, forwardRef, useEffect } from "react";
import ReactQuill from "react-quill";
import RichEditorMediaDialog from "../RichEditorMediaDialog";

const toolbarOptions = [
  [{'header': [2, 3, false]}],
  ['bold', 'italic', 'underline', 'blockquote', 'code-block'],
  [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
  ['link', 'image', 'video'],
  ['clean']
];

const modules = {
  toolbar: {
    container: toolbarOptions,
  }
};

const formats = [
  'header',
  'bold', 'italic', 'underline', 'blockquote', 'code-block',
  'list', 'bullet', 'indent',
  'link',
  'image', 'video',
];

interface RichEditorQuillProps {
  value: string;
  onChange: (value: string) => void;
  extra?: Record<string, any>;
}

interface RichEditorQuillRef {
  getEditor: () => any;
}

const RichEditorQuill = forwardRef<RichEditorQuillRef, RichEditorQuillProps>((props, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [quillSelection, setQuillSelection] = useState<any>(null);
  const editorRef = useRef<any>(null);
  const reactQuillRef = useRef<any>(null);

  useImperativeHandle(ref, () => ({
    getEditor: () => editorRef.current?.getEditor()
  }));

  useEffect(() => {
    if (reactQuillRef.current) {
      const editor = reactQuillRef.current.getEditor();
      if (editor) {
        editorRef.current = reactQuillRef.current;
        const toolbar = editor.getModule('toolbar');
        toolbar.addHandler('image', () => {
          setIsOpen(true);
          setMediaType('image');
          setQuillSelection(editor.getSelection());
        });
        toolbar.addHandler('video', () => {
          setIsOpen(true);
          setMediaType('video');
          setQuillSelection(editor.getSelection());
        });
      }
    }
  }, []);

  const {value, onChange, extra} = props;

  return (
    <div>
      <ReactQuill
        theme="snow"
        value={value || ''}
        onChange={onChange}
        modules={modules}
        formats={formats}
        ref={reactQuillRef}
      />
      <RichEditorMediaDialog
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        mediaType={mediaType}
        quill={editorRef.current?.getEditor()}
        quillSelection={quillSelection}
        extra={extra}
      />
    </div>
  );
});

RichEditorQuill.displayName = 'RichEditorQuill';

export default RichEditorQuill;