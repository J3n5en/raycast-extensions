import { Icon, List, getPreferenceValues } from "@raycast/api";
import { useEffect, useState } from "react";
import { QBittorrent, prettySize, RawTorrent, RawTorrentListFilter, RawTorrentState } from "qbit.js";

interface Preferences {
  address: string;
  username: string;
  password: string;
  timeout: number;
}
const iconMap = {
  [RawTorrentState.downloading]: "../assets/downloading.svg",
  [RawTorrentState.uploading]: "../assets/uploading.svg",
  [RawTorrentState.error]: "../assets/error.svg",
  [RawTorrentState.missingFiles]: "../assets/error.svg",
  [RawTorrentState.pausedUP]: "../assets/stalledUP.svg",
  [RawTorrentState.queuedUP]: "../assets/stalledUP.svg",
  [RawTorrentState.stalledUP]: "../assets/stalledUP.svg",
  [RawTorrentState.checkingUP]: "../assets/stalledUP.svg",
  [RawTorrentState.forcedUP]: "../assets/stalledUP.svg",
  [RawTorrentState.allocating]: "../assets/checking.svg",
  [RawTorrentState.metaDL]: "../assets/downloading.svg",
  [RawTorrentState.pausedDL]: "../assets/stalledDL.svg",
  [RawTorrentState.queuedDL]: "../assets/stalledDL.svg",
  [RawTorrentState.stalledDL]: "../assets/stalledDL.svg",
  [RawTorrentState.checkingDL]: "../assets/stalledDL.svg",
  [RawTorrentState.forcedDL]: "../assets/stalledDL.svg",
  [RawTorrentState.checkingResumeData]: "../assets/checking.svg",
  [RawTorrentState.moving]: "../assets/checking.svg",
  [RawTorrentState.unknown]: undefined,
};

export default function Command() {
  const [filter, setFilter] = useState<RawTorrentListFilter>();
  const [torrents, setTorrents] = useState<RawTorrent[]>([]);
  const [loading, setLoading] = useState(false);
  const [updateTimestap, setUpdateTimestap] = useState(+new Date());
  let updateTimeout: NodeJS.Timeout;

  const { address, username, password, timeout } = getPreferenceValues<Preferences>();

  const qbit = new QBittorrent(address);

  const updateTorrents = async () => {
    +timeout && updateTimeout && clearTimeout(updateTimeout);
    setLoading(true);
    await qbit.login(username, password);
    const torrents = await qbit.api.getTorrents({ filter });
    setLoading(false);
    setTorrents(torrents);
    if (+timeout) {
      updateTimeout = setTimeout(() => {
        setUpdateTimestap(+new Date());
      }, +timeout);
    }
  };

  useEffect(() => {
    updateTorrents();
  }, [updateTimestap, filter]);

  return (
    <List
      isLoading={loading}
      enableFiltering
      navigationTitle={`${filter} torrents`}
      searchBarPlaceholder="Search your torrents"
      searchBarAccessory={
        <List.Dropdown
          value={filter}
          tooltip="Filter by state"
          onChange={(newFilter) => {
            setFilter(newFilter as any);
          }}
        >
          {Object.keys(RawTorrentListFilter).map((key) => (
            <List.Dropdown.Item title={key} value={key} key={key} />
          ))}
        </List.Dropdown>
      }
    >
      {torrents.map((torrent, index) => {
        return (
          <List.Item
            icon={iconMap[torrent.state]}
            title={`${index + 1}.${torrent.name}(${prettySize(torrent.size)})`}
            key={torrent.infohash_v1}
            accessories={[
              {
                text: `↑${prettySize(torrent.upspeed)}/s`,
              },
              {
                text: `↓${prettySize(torrent.dlspeed)}/s`,
              },
            ]}
          />
        );
      })}
    </List>
  );
}
