import { type NextPage } from "next";
import Link from "next/link";
import { useAccount } from "wagmi";
import Layout from "../components/layout/Layout";

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
export const sites: Site[] = [
  {
    name: "Jensens Legekontor",
    link: "/doctor",
    description: "Besøk legen for å se om du trenger briller",
  },
  {
    name: "Statens Pengekrukke",
    link: "/welfare",
    description: "Bruk bevis fra legen til å få et bevis for pengestøtte",
  },
  {
    name: "Hansens Brilleforetning",
    link: "/optician",
    description: "Bruk bevis fra pengekrukka til å få avslag på nye briller",
  },
  {
    name: "Folkeregisteret",
    link: "/folkeregisteret",
    description: "Skaff deg et identitetsbevis fra folkeregisteret",
  },
];

const SiteList = (props: { sites: Site[] }) => {
  return (
    <div>
      {props.sites.map((site) => (
        <Link
          href={site.link}
          className="m-5 mx-auto flex max-w-sm items-center space-x-4 rounded-xl bg-white p-5 shadow-md"
        >
          <div>
            <div className="text-slate-500">{site.name}</div>
            <div className="font-small text-sm text-black">{site.description}</div>
          </div>
        </Link>
      ))}
    </div>
  );
};

const Home: NextPage = () => {
  const { isConnected } = useAccount();
  return (
    <Layout>
      {isConnected && <SiteList sites={sites} />}
      {!isConnected && <SiteList sites={sites} />}
    </Layout>
  );
};

export default Home;
