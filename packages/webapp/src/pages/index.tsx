import { ethers } from "ethers";
import { type NextPage } from "next";
import Link from "next/link";
import React from "react";
import { Login } from "../components/authentication/Login";
import { VcCard } from "../components/VcCard";

type Site = {
  name: string;
  link: `/${string}`;
  description: string;
};

/**
 * This array specifies the pages that are relevant
 * for the demo of Pengekrukka. The content is intended
 * to be rendered. In other words, they should explain
 * to the user why they would use the site.
 */
const sites: Site[] = [
  {
    name: "Jensens Legekontor",
    link: "/doctor",
    description: "Besøk legen for å se om du trenger briller",
  },
  {
    name: "Statens Pengekrukke",
    link: "/government",
    description: "Bruk bevis fra legen til å få et bevis for pengestøtte",
  },
  {
    name: "Hansens Brilleforetning",
    link: "/optician",
    description: "Bruk bevis fra pengekrukka til å få avslag på nye briller",
  },
];

const SiteList = (props: { sites: Site[] }) => {
  return (
    <div>
      {props.sites.map((site) => (
        <Link
          href={site.link}
          className="mx-auto flex max-w-sm items-center space-x-4 rounded-xl bg-white p-6 shadow-md"
        >
          <div>
            <div className="text-slate-500">{site.name}</div>
            <div className="font-small text-sm text-black">
              {site.description}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

const Home: NextPage = () => {
  const [signer, setSigner] = React.useState<ethers.Signer>();

  if (signer) {
    return <SiteList sites={sites} />;
  }

  return (
    <div>
      <VcCard
        subject={{ id: "did:ethr:test", title: "Brillebevis" }}
        types={["GlassesProofCredential", "VerifiableCredential"]}
      />
      <h1>Logg inn med din wallet for å begynne demo</h1>
      <Login setSigner={setSigner} />
    </div>
  );
};

export default Home;
