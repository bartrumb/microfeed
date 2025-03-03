import React from "react";
import ReactQuill, {Quill} from "react-quill";
import BlotFormatter from "quill-blot-formatter";
import RichEditorMediaDialog from "../RichEditorMediaDialog";

// Only register if not already registered
if (!Quill.imports['modules/blotFormatter']) {
  try {
    Quill.register('modules/blotFormatter', BlotFormatter);
  } catch (e) {
    console.warn('Failed to register blotFormatter:', e);
  }
}

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
    // handlers: {
    //   image: imageHandler,
    //   video: videoHandler,
    // },
  },
  blotFormatter: {
    // see config options below
    overlay: {
      style: { border: '2px solid #06c' }
    }
  },
};

const formats = [
  'header',
  'bold', 'italic', 'underline', 'blockquote', 'code-block',
  'list', 'bullet', 'indent',
  'link',
  'image', 'video',
];

export default class RichEditorQuill extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
      mediaType: 'image',
      quillSelection: null,
    };
  }

  componentDidMount() {
    this.attachQuillRefs();
    // Initialize modules after mount
    if (this.quillRef) {
      try {
        const formatter = this.quillRef.getModule('blotFormatter');
        if (!formatter) {
          console.warn('BlotFormatter module not initialized');
        }
      } catch (e) {
        console.warn('Error checking blotFormatter:', e);
      }
    }
  }

  componentDidUpdate() {
    this.attachQuillRefs();
  }

  attachQuillRefs() {
    if (typeof this.reactQuillRef.getEditor !== 'function') return;
    this.quillRef = this.reactQuillRef.getEditor();
  }

  render() {
    const {value, onChange, extra} = this.props;
    const {isOpen, mediaType, quillSelection} = this.state;
    return <div>
    <ReactQuill
      theme="snow"
      value={value || ''}
      onChange={onChange}
      modules={modules}
      formats={formats}
      ref={(ref) => {
        if (ref) {
          this.reactQuillRef = ref;
          this.quillRef = ref.getEditor();
          const toolbar = this.quillRef.getModule('toolbar');
          toolbar.addHandler('image', () => {
            this.setState({isOpen: true, mediaType: 'image', quillSelection: this.quillRef.getSelection()});
          });
          toolbar.addHandler('video', () => {
            this.setState({isOpen: true, mediaType: 'video', quillSelection: this.quillRef.getSelection()});
          });
        }
      }}
    />
    <RichEditorMediaDialog
      isOpen={isOpen}
      setIsOpen={(isOpen) => this.setState({isOpen})}
      mediaType={mediaType}
      quill={this.quillRef}
      quillSelection={quillSelection}
      extra={extra}
    />
  </div>
  }
}
