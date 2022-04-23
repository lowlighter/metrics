/**Mocked data */
export default function({faker, query, login = faker.internet.userName()}) {
  console.debug("metrics/compute/mocks > mocking graphql api result > licenses/default")
  return ({
    licenses: [
      {
        spdxId: "AGPL-3.0",
        name: "GNU Affero General Public License v3.0",
        nickname: "GNU AGPLv3",
        key: "agpl-3.0",
        limitations: [
          {key: "liability", label: "Liability"},
          {key: "warranty", label: "Warranty"},
        ],
        conditions: [
          {key: "include-copyright", label: "License and copyright notice"},
          {key: "document-changes", label: "State changes"},
          {key: "disclose-source", label: "Disclose source"},
          {key: "network-use-disclose", label: "Network use is distribution"},
          {key: "same-license", label: "Same license"},
        ],
        permissions: [
          {key: "commercial-use", label: "Commercial use"},
          {key: "modifications", label: "Modification"},
          {key: "distribution", label: "Distribution"},
          {key: "patent-use", label: "Patent use"},
          {key: "private-use", label: "Private use"},
        ],
      },
      {
        spdxId: "Apache-2.0",
        name: "Apache License 2.0",
        nickname: null,
        key: "apache-2.0",
        limitations: [
          {key: "trademark-use", label: "Trademark use"},
          {key: "liability", label: "Liability"},
          {key: "warranty", label: "Warranty"},
        ],
        conditions: [
          {key: "include-copyright", label: "License and copyright notice"},
          {key: "document-changes", label: "State changes"},
        ],
        permissions: [
          {key: "commercial-use", label: "Commercial use"},
          {key: "modifications", label: "Modification"},
          {key: "distribution", label: "Distribution"},
          {key: "patent-use", label: "Patent use"},
          {key: "private-use", label: "Private use"},
        ],
      },
      {
        spdxId: "BSD-2-Clause",
        name: 'BSD 2-Clause "Simplified" License',
        nickname: null,
        key: "bsd-2-clause",
        limitations: [
          {key: "liability", label: "Liability"},
          {key: "warranty", label: "Warranty"},
        ],
        conditions: [
          {key: "include-copyright", label: "License and copyright notice"},
        ],
        permissions: [
          {key: "commercial-use", label: "Commercial use"},
          {key: "modifications", label: "Modification"},
          {key: "distribution", label: "Distribution"},
          {key: "private-use", label: "Private use"},
        ],
      },
      {
        spdxId: "BSD-3-Clause",
        name: 'BSD 3-Clause "New" or "Revised" License',
        nickname: null,
        key: "bsd-3-clause",
        limitations: [
          {key: "liability", label: "Liability"},
          {key: "warranty", label: "Warranty"},
        ],
        conditions: [
          {key: "include-copyright", label: "License and copyright notice"},
        ],
        permissions: [
          {key: "commercial-use", label: "Commercial use"},
          {key: "modifications", label: "Modification"},
          {key: "distribution", label: "Distribution"},
          {key: "private-use", label: "Private use"},
        ],
      },
      {
        spdxId: "BSL-1.0",
        name: "Boost Software License 1.0",
        nickname: null,
        key: "bsl-1.0",
        limitations: [
          {key: "liability", label: "Liability"},
          {key: "warranty", label: "Warranty"},
        ],
        conditions: [
          {key: "include-copyright--source", label: "License and copyright notice for source"},
        ],
        permissions: [
          {key: "commercial-use", label: "Commercial use"},
          {key: "modifications", label: "Modification"},
          {key: "distribution", label: "Distribution"},
          {key: "private-use", label: "Private use"},
        ],
      },
      {
        spdxId: "CC0-1.0",
        name: "Creative Commons Zero v1.0 Universal",
        nickname: null,
        key: "cc0-1.0",
        limitations: [
          {key: "liability", label: "Liability"},
          {key: "trademark-use", label: "Trademark use"},
          {key: "patent-use", label: "Patent use"},
          {key: "warranty", label: "Warranty"},
        ],
        conditions: [],
        permissions: [
          {key: "commercial-use", label: "Commercial use"},
          {key: "modifications", label: "Modification"},
          {key: "distribution", label: "Distribution"},
          {key: "private-use", label: "Private use"},
        ],
      },
      {
        spdxId: "EPL-2.0",
        name: "Eclipse Public License 2.0",
        nickname: null,
        key: "epl-2.0",
        limitations: [
          {key: "liability", label: "Liability"},
          {key: "warranty", label: "Warranty"},
        ],
        conditions: [
          {key: "disclose-source", label: "Disclose source"},
          {key: "include-copyright", label: "License and copyright notice"},
          {key: "same-license", label: "Same license"},
        ],
        permissions: [
          {key: "commercial-use", label: "Commercial use"},
          {key: "distribution", label: "Distribution"},
          {key: "modifications", label: "Modification"},
          {key: "patent-use", label: "Patent use"},
          {key: "private-use", label: "Private use"},
        ],
      },
      {
        spdxId: "GPL-2.0",
        name: "GNU General Public License v2.0",
        nickname: "GNU GPLv2",
        key: "gpl-2.0",
        limitations: [
          {key: "liability", label: "Liability"},
          {key: "warranty", label: "Warranty"},
        ],
        conditions: [
          {key: "include-copyright", label: "License and copyright notice"},
          {key: "document-changes", label: "State changes"},
          {key: "disclose-source", label: "Disclose source"},
          {key: "same-license", label: "Same license"},
        ],
        permissions: [
          {key: "commercial-use", label: "Commercial use"},
          {key: "modifications", label: "Modification"},
          {key: "distribution", label: "Distribution"},
          {key: "private-use", label: "Private use"},
        ],
      },
      {
        spdxId: "GPL-3.0",
        name: "GNU General Public License v3.0",
        nickname: "GNU GPLv3",
        key: "gpl-3.0",
        limitations: [
          {key: "liability", label: "Liability"},
          {key: "warranty", label: "Warranty"},
        ],
        conditions: [
          {key: "include-copyright", label: "License and copyright notice"},
          {key: "document-changes", label: "State changes"},
          {key: "disclose-source", label: "Disclose source"},
          {key: "same-license", label: "Same license"},
        ],
        permissions: [
          {key: "commercial-use", label: "Commercial use"},
          {key: "modifications", label: "Modification"},
          {key: "distribution", label: "Distribution"},
          {key: "patent-use", label: "Patent use"},
          {key: "private-use", label: "Private use"},
        ],
      },
      {
        spdxId: "LGPL-2.1",
        name: "GNU Lesser General Public License v2.1",
        nickname: "GNU LGPLv2.1",
        key: "lgpl-2.1",
        limitations: [
          {key: "liability", label: "Liability"},
          {key: "warranty", label: "Warranty"},
        ],
        conditions: [
          {key: "include-copyright", label: "License and copyright notice"},
          {key: "disclose-source", label: "Disclose source"},
          {key: "document-changes", label: "State changes"},
          {key: "same-license--library", label: "Same license (library)"},
        ],
        permissions: [
          {key: "commercial-use", label: "Commercial use"},
          {key: "modifications", label: "Modification"},
          {key: "distribution", label: "Distribution"},
          {key: "private-use", label: "Private use"},
        ],
      },
      {
        spdxId: "MIT",
        name: "MIT License",
        nickname: null,
        key: "mit",
        limitations: [
          {key: "liability", label: "Liability"},
          {key: "warranty", label: "Warranty"},
        ],
        conditions: [
          {key: "include-copyright", label: "License and copyright notice"},
        ],
        permissions: [
          {key: "commercial-use", label: "Commercial use"},
          {key: "modifications", label: "Modification"},
          {key: "distribution", label: "Distribution"},
          {key: "private-use", label: "Private use"},
        ],
      },
      {
        spdxId: "MPL-2.0",
        name: "Mozilla Public License 2.0",
        nickname: null,
        key: "mpl-2.0",
        limitations: [
          {key: "liability", label: "Liability"},
          {key: "trademark-use", label: "Trademark use"},
          {key: "warranty", label: "Warranty"},
        ],
        conditions: [
          {key: "disclose-source", label: "Disclose source"},
          {key: "include-copyright", label: "License and copyright notice"},
          {key: "same-license--file", label: "Same license (file)"},
        ],
        permissions: [
          {key: "commercial-use", label: "Commercial use"},
          {key: "modifications", label: "Modification"},
          {key: "distribution", label: "Distribution"},
          {key: "patent-use", label: "Patent use"},
          {key: "private-use", label: "Private use"},
        ],
      },
      {
        spdxId: "Unlicense",
        name: "The Unlicense",
        nickname: null,
        key: "unlicense",
        limitations: [
          {key: "liability", label: "Liability"},
          {key: "warranty", label: "Warranty"},
        ],
        conditions: [],
        permissions: [
          {key: "private-use", label: "Private use"},
          {key: "commercial-use", label: "Commercial use"},
          {key: "modifications", label: "Modification"},
          {key: "distribution", label: "Distribution"},
        ],
      },
    ],
  })
}
