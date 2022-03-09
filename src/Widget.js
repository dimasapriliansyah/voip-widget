import * as React from "react";

import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Card from "@mui/material/Card";
import Checkbox from "@mui/material/Checkbox";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Container from "@mui/material/Container";
import TextField from "@mui/material/TextField";
import Avatar from "@mui/material/Avatar";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import CardActions from "@mui/material/CardActions";
import Button from "@mui/material/Button";
import SpeedDial from "@mui/material/SpeedDial";
import SpeedDialIcon from "@mui/material/SpeedDialIcon";
import SpeedDialAction from "@mui/material/SpeedDialAction";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";

import PhoneInTalkIcon from "@mui/icons-material/PhoneInTalk";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import CloseIcon from "@mui/icons-material/Close";
import ContactSupportIcon from "@mui/icons-material/ContactSupport";
import PhoneDisabledIcon from "@mui/icons-material/PhoneDisabled";
import MicOffIcon from "@mui/icons-material/MicOff";
import MicIcon from "@mui/icons-material/Mic";
import CryptoJS from "crypto-js";


import DTMFSound from "./assets/dtmf.wav";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "300px !important",
  bgcolor: "background.paper",
  border: "1px solid",
  boxShadow: 24,
  p: 4,
};

const Item = styled(Paper)(({ theme }) => ({
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
}));

const actions = [{ icon: <PhoneInTalkIcon />, name: "Call" }];

const CssTextField = styled(TextField)({
  "& label.Mui-focused": {
    color: "##1665C0",
  },
  "& .MuiInput-underline:after": {
    borderBottomColor: "#1665C0",
  },
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: "#E6232C",
    },
    "&:hover fieldset": {
      borderColor: "#001219",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#1665C0",
    },
  },
});

export default class BasicSpeedDial extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      inputName: '',
      inputEmail: '',
      showDialForm: false,
      reqExten: {
        token: "",
        exten: "",
        secret: "",
        callto: "",
        sip: "",
        rtc: "",
        api: "",
      },
      isLoadingSetupWebphone: false,
      openSpeedDial: false,
      openModal: false,
      oSipStack: null,
      oSipLastEvent: {
        type: "",
        description: "",
      },
      oSipSessionCall: null,
      oSipIsMuted: false,
      oSipIsConnected: false,
      oSipIsCallFinished: false,
      oSipIsMutedError: "",
      oSipDTMFPressed: "",
      modalAgree: false,
    };

    this.wrapperRef = React.createRef();
    this.DTMFAudio = new Audio(DTMFSound);
    this.handleClickOutside = this.handleClickOutside.bind(this);
    this.onSipEventStack = this.onSipEventStack.bind(this);
    this.onSipEventSession = this.onSipEventSession.bind(this);
    this.onSipCallSession = this.onSipCallSession.bind(this);
    this.handleInputName = this.handleInputName.bind(this);
    this.handleInputEmail = this.handleInputEmail.bind(this);
  }

  componentDidMount() {
    document.addEventListener("mousedown", this.handleClickOutside);
  }

  componentWillUnmount() {
    document.removeEventListener("mousedown", this.handleClickOutside);
  }

  requestExtension() {
    var myHeaders = new Headers();
    myHeaders.append("Authorization", "Basic ZGVtbzoxbmYwbWVkaUA=");
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({
      username: this.state.inputName,
      email: this.state.inputEmail,
      token: process.env.REACT_APP_EXTEN_TOKEN,
      type: process.env.REACT_APP_EXTEN_TYPE
    });

    console.log("this.state.input>>>", this.state.input)

    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
    };

    return fetch(process.env.REACT_APP_EXTEN_URL, requestOptions)
      .then(response => response.text())
      .then(result => {
        const decryptText = this.decrypt(result)
        const decrypted = JSON.parse(decryptText)

        console.log("decrypted>>>", decrypted)

        this.setState({
          reqExten: {
            token: decrypted.token,
            exten: decrypted.exten,
            secret: decrypted.secret,
            callto: decrypted.callto,
            sip: decrypted.sip,
            rtc: decrypted.rtc,
            api: decrypted.api,
          },
        });

      })
      .catch(error => console.log('error', error));
  }

  decrypt(val) {
    try {
      const IV = process.env.REACT_APP_DECODE_IV;
      const KEY = process.env.REACT_APP_DECODE_KEY;
      var encrypted = CryptoJS.enc.Base64.parse(val);
      var key = CryptoJS.enc.Utf8.parse(KEY);
      var iv = CryptoJS.enc.Utf8.parse(IV);

      var decrypted = CryptoJS.AES.decrypt(
        {
          ciphertext: encrypted,
        },
        key,
        {
          iv: iv,
          mode: CryptoJS.mode.CTR,
          padding: CryptoJS.pad.NoPadding,
        }
      );
      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (err) {
      return false;
    }
  };

  handleInputName(e) {
    this.setState({
      inputName: e.target.value
    })
  }

  handleInputEmail(e) {
    this.setState({
      inputEmail: e.target.value
    })
  }

  handleClickOutside(event) {
    if (this.wrapperRef && !this.wrapperRef.current.contains(event.target)) {
      this.setState({
        showDialForm: false,
      });
    }
  }

  setShowDialForm() {
    this.setState({
      showDialForm: true,
      openSpeedDial: false,
    });
  }

  openModal() {
    this.setState({ openModal: true, showDialForm: false });
  }

  closeModal(event, reason) {
    if (reason !== "backdropClick" && reason !== "escapeKeyDown") {
      this.setState({ openModal: false });
    }
  }

  endCall() {
    window.location.reload();
  }

  handleOpenSpeedDial() {
    this.setState({ showDialForm: false, openSpeedDial: true });
  }

  handleCloseSpeedDial() {
    this.setState({ openSpeedDial: false });
  }

  loadWebphoneLib(callback) {
    const existingScript = document.getElementById("voipx-inf-webphone");
    if (!existingScript) {
      const script = document.createElement("script");
      script.src = "https://onx.co.id/voip-bpjs/js/sipML.js";
      script.id = "voipx-inf-webphone";
      document.body.appendChild(script);
      script.onload = () => {
        if (callback) callback();
      };
    }
    if (existingScript && callback) callback();
  }

  async initiateWebphone(e) {
    e.preventDefault();

    await this.requestExtension();

    document.removeEventListener("mousedown", this.handleClickOutside);

    this.setState({
      isLoadingSetupWebphone: true,
    });
    this.loadWebphoneLib(() => {
      this.setState({
        isLoadingSetupWebphone: false,
      });

      this.openModal();

      const config = {
        realm: this.state.reqExten.sip,
        impi: this.state.reqExten.exten,
        impu: `sip:${this.state.reqExten.exten}@${this.state.reqExten.sip}`,
        password: this.state.reqExten.secret,
        display_name: this.state.reqExten.exten,
        websocket_proxy_url: this.state.reqExten.rtc,
        outbound_proxy_url: "",
        ice_servers: "",
        enable_rtcweb_breaker: false,
        events_listener: { events: "*", listener: this.onSipEventStack },
        enable_early_ims: true, // Must be true unless you're using a real IMS network
        enable_media_stream_cache: false,
        bandwidth: undefined, // could be redefined a session-level
        video_size: undefined, // could be redefined a session-level
        sip_headers: [
          {
            name: "User-Agent",
            value: "IM-client/OMA1.0 sipML5-v1.2016.03.04",
          },
          { name: "Organization", value: "Infomedia Nusantara" },
        ],
      };

      const oSipStack = new window.SIPml.Stack(config);

      this.setState({ oSipStack: oSipStack });

      this.state.oSipStack.start();
    });
  }

  onSipEventStack(e) {
    console.log("Event onSipEventStack", e);

    this.setState({
      oSipLastEvent: {
        type: e.type,
        description: e.description,
      },
    });

    if (e.type === "started") {
      const oConfigCall = {
        audio_remote: document.getElementById("audio_remote"),
        bandwidth: undefined,
        events_listener: {
          events: "*",
          listener: this.onSipEventSession,
        },
        screencast_window_id: 0,
        sip_caps: [
          { name: "+g.oma.sip-im" },
          { name: "language", value: '"en,fr"' },
        ],
      };
      const oSipSessionCall = this.state.oSipStack.newSession(
        "call-audio",
        oConfigCall
      );

      this.setState({
        oSipSessionCall: oSipSessionCall,
      });

      const callResult = this.state.oSipSessionCall.call(this.state.reqExten.callto, {
        events_listener: {
          events: "*",
          listener: this.onSipCallSession,
        },
      });
      console.log("callResult", callResult);
    }
    if (e.type === "m_permission_accepted") {
      this.setState({
        oSipLastEvent: {
          type: e.type,
          description: "Setting up, please wait it may take a while",
        },
      });
    }
    if (e.type === "stopped") {
      this.setState({
        oSipLastEvent: {
          type: e.type,
          description: "Call finished",
        },
      });
    }
  }

  onSipEventSession(e) {
    console.log("Event onSipEventSession", e);

    this.setState({
      oSipLastEvent: {
        type: e.type,
        description: e.description,
      },
    });
  }

  onSipCallSession(e) {
    console.log("Event onSipCallSession", e);

    this.setState({
      oSipLastEvent: {
        type: e.type,
        description: e.description,
      },
    });
    if (e.type === "m_stream_audio_remote_added") {
      this.setState({
        oSipIsConnected: true,
        oSipLastEvent: {
          type: e.type,
          description: "Connected",
        },
      });
    }
    if (e.type === "terminated") {
      this.sipHangUp();
    }
  }

  onDialPadPressed(e) {
    console.log("onDialPadPressed", e);
    const pad = e.toString();
    if (this.state.oSipSessionCall) {
      if (this.state.oSipSessionCall.dtmf(pad) === 0) {
        try {
          this.DTMFAudio.play();
          this.setState((state) => ({
            oSipDTMFPressed: state.oSipDTMFPressed + pad,
          }));
        } catch (e) { }
      }
    }
  }

  sipHangUp() {
    if (this.state.oSipSessionCall) {
      this.state.oSipSessionCall.hangup({
        events_listener: { events: "*", listener: this.onSipEventSession },
      });
      this.state.oSipStack.stop({
        events_listener: { events: "*", listener: this.onSipEventSession },
      });
      this.setState({ oSipIsCallFinished: true });
    }
  }

  sipToggleMute() {
    if (this.state.oSipSessionCall) {
      const toggleMuteSuccess = this.state.oSipSessionCall.mute(
        "audio",
        this.state.oSipIsMuted
      );

      if (toggleMuteSuccess !== 0) {
        this.setState({ oSipIsMutedError: "Mute / Unmute failed" });
        return;
      }

      this.setState({ oSipIsMuted: !this.state.oSipIsMuted });
    }
  }

  render() {
    return (
      <Box ref={this.wrapperRef} sx={{ color: "#f1faee" }}>
        {this.state.showDialForm ? (
          <Card
            sx={{
              position: "fixed",
              bottom: 100,
              right: 10,
              height: "500px !important",
              width: "350px !important",
            }}
          >
            <CardHeader
              sx={{ bgcolor: "#E6232C" }}
              avatar={
                <Avatar sx={{ bgcolor: "#01A3DE" }}>
                  <ContactSupportIcon />
                </Avatar>
              }
              title="Customer Call Support"
              titleTypographyProps={{ color: "#f1faee" }}
              subheader="Operational hours: 08.00-16.00"
              subheaderTypographyProps={{
                color: "#f1faee",
                fontStyle: "italic",
              }}
            />
            <CardContent sx={{ overflowY: "scroll" }}>
              <Container>
                <form onSubmit={(e) => this.initiateWebphone(e)}>
                  <CssTextField
                    value={this.state.inputName}
                    onChange={(e) => this.handleInputName(e)}
                    disabled={this.state.isLoadingSetupWebphone}
                    fullWidth
                    required
                    color="info"
                    id="form-name"
                    label="Name"
                    size="small"
                    margin="dense"
                  />
                  <CssTextField
                    value={this.state.inputEmail}
                    onChange={(e) => this.handleInputEmail(e)}
                    disabled={this.state.isLoadingSetupWebphone}
                    fullWidth
                    required
                    color="info"
                    id="form-email"
                    label="Email"
                    size="small"
                    margin="dense"
                  />
                  <CssTextField
                    disabled={this.state.isLoadingSetupWebphone}
                    fullWidth
                    required
                    color="info"
                    id="form-phone"
                    label="Phone"
                    size="small"
                    margin="dense"
                  />
                  <CssTextField
                    disabled={this.state.isLoadingSetupWebphone}
                    fullWidth
                    required
                    id="form-message"
                    color="info"
                    label="Message"
                    size="small"
                    margin="dense"
                    multiline
                    rows={4}
                  />
                  <Checkbox required />
                  <Link href="#">
                    <Typography
                      component="span"
                      fontStyle="italic"
                      fontSize={12}
                      onClick={() => this.setState({ modalAgree: true })}
                    >
                      I Agree with terms & conditions
                    </Typography>
                  </Link>
                  <Button
                    disabled={this.state.isLoadingSetupWebphone}
                    type="submit"
                    sx={{ marginTop: "1em" }}
                    color="primary"
                    variant="outlined"
                    startIcon={<PhoneInTalkIcon />}
                  >
                    {this.state.isLoadingSetupWebphone ? (
                      <>
                        <CircularProgress size={20} color="inherit" />
                      </>
                    ) : (
                      "Click to Call"
                    )}
                  </Button>
                </form>
              </Container>
            </CardContent>
            <CardActions></CardActions>
          </Card>
        ) : null}

        <SpeedDial
          onClose={() => this.handleCloseSpeedDial()}
          onOpen={() => this.handleOpenSpeedDial()}
          open={this.state.openSpeedDial}
          sx={{ position: "fixed", bottom: 40, right: 40 }}
          ariaLabel="Customer Support Dial"
          icon={
            <SpeedDialIcon
              icon={<SupportAgentIcon fontSize="medium" />}
              openIcon={<CloseIcon />}
            />
          }
        >
          <SpeedDialAction
            sx={{
              bgcolor: "#E6232C",
              color: "#FFFFFF",
              "&:hover": {
                bgcolor: "#E6232C",
                color: "#FFFFFF",
              },
              "&:focus": {
                bgcolor: "#E6232C",
                color: "#FFFFFF",
              },
            }}
            onClick={() => this.setShowDialForm(true)}
            icon={actions[0].icon}
            tooltipTitle={actions[0].name}
          />
        </SpeedDial>

        <Modal
          disableEscapeKeyDown={true}
          open={this.state.openModal}
          onClose={(e, r) => this.closeModal(e, r)}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            <Typography
              sx={{ color: "#1976D2" }}
              variant="h6"
              textAlign="center"
            >
              {this.state.oSipDTMFPressed}
            </Typography>
            <Typography textAlign="center" fontStyle={"italic"}>
              {this.state.oSipLastEvent.description}
            </Typography>
            <Grid
              container
              rowSpacing={1}
              columnSpacing={{ xs: 1 }}
              sx={{ my: 2 }}
            >
              <Grid item xs={6}>
                <Button
                  disabled={!this.state.oSipIsConnected || this.state.oSipIsCallFinished}
                  onClick={() => this.sipToggleMute()}
                  fullWidth
                  variant={this.state.oSipIsMuted ? "contained" : "outlined"}
                  startIcon={
                    this.state.oSipIsMuted ? <MicIcon /> : <MicOffIcon />
                  }
                >
                  {this.state.oSipIsMuted ? "Unmute" : "Mute"}
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  disabled={!this.state.oSipIsConnected || this.state.oSipIsCallFinished}
                  onClick={() => this.sipHangUp()}
                  fullWidth
                  color="error"
                  variant="outlined"
                  startIcon={<PhoneDisabledIcon />}
                >
                  Hangup
                </Button>
              </Grid>
            </Grid>

            <Grid container rowSpacing={1} columnSpacing={{ xs: 1 }}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, "*", 0, "#"].map((d, i) => (
                <Grid
                  onClick={() => this.onDialPadPressed(d)}
                  key={i}
                  item
                  xs={4}
                >
                  <Item
                    sx={{
                      cursor: "pointer",
                      "&:hover": { bgcolor: "#f4f4f4" },
                      "&:focus": { bgcolor: "#f4f4f4" },
                    }}
                  >
                    {d}
                  </Item>
                </Grid>
              ))}
            </Grid>

            <Grid
              container
              rowSpacing={1}
              columnSpacing={{ xs: 1 }}
              sx={{ my: 2 }}
            >
              <Grid item xs={12}>
                <Button
                  disabled={!this.state.oSipIsCallFinished}
                  onClick={() => this.endCall()}
                  fullWidth
                  variant="outlined"
                >
                  End Call
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Modal>
        <ModalAgree
          open={this.state.modalAgree}
          onClose={() => this.setState({ modalAgree: false })}
        />
        <audio id="audio_remote" autoPlay="autoplay"></audio>
      </Box>
    );
  }
}

const ModalAgree = (props) => {
  const { open, onClose } = props;
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle sx={{ fontSize: "0.95rem" }}>
        Terms & Conditions
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ width: "500px", height: "400px" }}>
        <Box sx={{ backgroundColor: '#f4f4f4', width: "500px", height: "400px" }}>

          <Typography fontSize={14}>
            1.Dengan menggunakan layanan Click to Dial ini, maka anda telah
            menyetujui bahwa percakapan anda kami rekam.
          </Typography>
          <br></br>
          <Typography fontSize={14}>
            2.Petugas berhak untuk mengakhiri percakapan lebih awal jika dalam
            interaksi terdapat unsur SARA, Seksual, dan perbuatan tidak
            menyenangkan.
          </Typography>

        </Box>
      </DialogContent>
    </Dialog>
  );
};
