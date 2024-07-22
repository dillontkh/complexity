import CPLXApi from "@/services/CPLXApi";
import { compareVersions } from "@/utils/utils";
import { useQuery } from "@tanstack/react-query";

import packageData from "../../../package.json";

export default function useExtensionUpdate({
  forceFetchChangelog,
}: {
  forceFetchChangelog?: boolean;
}) {
  const { data } = useQuery({
    queryKey: ["cplxVersions"],
    queryFn: () => CPLXApi.fetchVersions(),
    refetchOnWindowFocus: false,
  });

  const newVersionAvailable =
    compareVersions(data?.public || "0", packageData.version) === 1;

  const { data: changelog, isLoading: isChangelogFetching } = useQuery({
    queryKey: ["changelog"],
    queryFn: () =>
      CPLXApi.fetchChangelog({
        type: "public",
      }),
    enabled: newVersionAvailable || forceFetchChangelog,
  });

  return {
    newVersionAvailable,
    newVersion: data?.public,
    changelog,
    isChangelogFetching,
  };
}
