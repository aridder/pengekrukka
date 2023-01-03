import {
  AssuredWorkload,
  MedicalInformation,
  SvgIconComponent,
  VerifiedUser,
} from "@mui/icons-material";
import { BaseSubject, VerifiableCredentialType } from "@pengekrukka/vc-shared";

type Props = { subject: BaseSubject; types: VerifiableCredentialType[] };

const Icons: { [key in VerifiableCredentialType]: SvgIconComponent } = {
  GlassesProofCredential: MedicalInformation,
  VerifiableCredential: VerifiedUser,
  WelfareCredential: AssuredWorkload,
};

const Colors: { [key in VerifiableCredentialType]: string } = {
  GlassesProofCredential: "blue",
  VerifiableCredential: "blue",
  WelfareCredential: "blue",
};

/**
 * fugly way of getting a color
 * acceptable because it's a hackathon
 */
const getColor = (types: VerifiableCredentialType[]) => {
  if (types.includes("GlassesProofCredential")) {
    return "blue";
  }

  if (types.includes("WelfareCredential")) {
    return "orange";
  }

  if (types.includes("VerifiableCredential")) {
    return "red";
  }
  return "purple";
};

const IconList = (props: {
  types: VerifiableCredentialType[];
  className: string | undefined;
}) => (
  ///TODO: add icons
  <div className={props.className}>
    {props.types
      .map((type) => Icons[type])
      .map((Icon) => (
        <Icon />
      ))}
  </div>
);

export const VcCard = (props: Props) => (
  <div
    className="border-1 grid h-56 w-96  grid-cols-1 rounded-xl border-black"
    style={{ backgroundColor: getColor(props.types) }}
  >
    <IconList types={props.types} className="place-self-end " />
    <p className=" p-10 py-5 text-lg font-bold">{props.subject.title}</p>
    <div className="place-self-end ">{props.subject.expirationDate} </div>
  </div>
);
