import { Post, Discovery, Meet, Course, NotificationItem } from './types';

export const INITIAL_POSTS: Post[] = [
  {
    id: 'post-1',
    username: 'Alex_Mech',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD-uU4NGzj_E67WdGyuC1iK-dZf-JfheSQC051fM8oeTbj0ugPXnlIGmrKP0EGAp3ck1Y-Ur86m-psk9qY41607o4DtXMZ6TW8qFwDkYLZ5rEzQ7gpPGtGg_-sGHJbXHpD6vfHSq7HyogzRIHd8HmnZ7Hv4SpL6gAVMDjJD_vMwVg4SfwHtOKqk7OvKF6ojdcsqhA62j24Q2i2M4jni7CN71J7ybmjG4i1MYBMxCyFvIUmtX8_qkklbKi1J0jwkAvVK06A9buIjgew',
    timeAgo: 'Πριν 2 ώρες',
    contentImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCQSQ6XOQdMwb4OYtDOyBSTievOF4tmo6wyslfqLl2xgSxBjVmjhX1OW8MdLsjBvs9MgPwvCy6rtQ1NZU9eYUyA8Lft3jKg2TwwjjYK2YKCudrIqA1M-neS04nVN41wNvTpwXPQAmINvgVv8SZH4QuMkhzqrSNhIgtf24c7IawUmcAKMzG9kVtfSIJNOHTBmB0ahS7b9rgh7oCWIFzStbseAU7YIdSphPxRWgdVLFiCa5iBkaM3aSAnlm19xQ6tsrRaOmBcOG8KHOM',
    engineTag: 'V8 Twin-Turbo',
    likes: 1240,
    fireCount: 450,
    commentsCount: 2,
    category: 'Αυτοκίνητα',
    contentText: 'Η τέλεια ισορροπία μεταξύ αεροδυναμικής και ωμής δύναμης. Ανάλυση της ροής αέρα στον νέο διαχύτη. 🏎️💨 #Engineering #Aerodynamics #V8Turbo',
    commentsList: [
      {
        id: 'c1',
        username: 'Sky_Engineer',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBVufzs93w5_9c3QXsuzVKyrlQYS8RgTYXTFknIvCTrWV1q07BDTNiq2HJZCyV1GHPubEoUxjH1inhSe2DeIo9nXiECNdbej-EavDvwboaRX2QWSZCOA0az-b27yjNVfHfmNAmPS_8q5xwEtkBxQuPghHR6mb0GAUbLbc4wB8Ld9MB4flrN8t-lrjqCVcgDJ6T4eoFP1NoN3WpVBEqVx-6IBnstInr8Kh_U5zUt0uMbWg2BF7LajtPwCbIf9B1UoAbzE2e9-BHfFi4',
        timeAgo: 'Πριν 1 ώρα',
        text: 'Απίστευτος σχεδιασμός! Ο συντελεστής οπισθέλκουσας πρέπει να είναι εξαιρετικά χαμηλός.'
      },
      {
        id: 'c2',
        username: 'Turbo_Fan',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDa1FDxt53YfmvePiBufpeDPyXMq7dhjR9M46N9bRKTTvq6StloRvBjKkaZheHSYFiMw89U8Uuv4EppFhLOCOxGqRAbIw2JQ23i3-fD0Yh4cgT_5BxUmb97MK0CNyCoPUsBWlduixfdr2MmiROMXhHuQ7Ffxt5lVZFLOENjzLy2Zbo_pC5PLHYbM45Db9_OX-rmWcgmxBMz8-JTA8js9kWvUgo3D-Dqr8uVrg_62-xiHYakkKGH8xtGv6wwGaxg26rz1hAoTMoxdwY',
        timeAgo: 'Πριν 45 λεπτά',
        text: 'Θα δούμε δοκιμές σε δυναμόμετρο σύντομα;'
      }
    ]
  },
  {
    id: 'post-2',
    username: 'Sky_Engineer',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBVufzs93w5_9c3QXsuzVKyrlQYS8RgTYXTFknIvCTrWV1q07BDTNiq2HJZCyV1GHPubEoUxjH1inhSe2DeIo9nXiECNdbej-EavDvwboaRX2QWSZCOA0az-b27yjNVfHfmNAmPS_8q5xwEtkBxQuPghHR6mb0GAUbLbc4wB8Ld9MB4flrN8t-lrjqCVcgDJ6T4eoFP1NoN3WpVBEqVx-6IBnstInr8Kh_U5zUt0uMbWg2BF7LajtPwCbIf9B1UoAbzE2e9-BHfFi4',
    timeAgo: 'Πριν 5 ώρες',
    contentImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAjQdyIYKS2_h5eYbs_el3M6-zgaJpWR4P3OgnTBASZ0A-e5BK4a0MLt0IznDYLWr0TQjMiz2H_vQ2t3S7IrtRbzOEhKac7vJAuWGofwOEEjHNgVohyOfBXwB8DsORPVHB7kG4v2rIJIpml01UhVy99gw881DUZtScDS8YeVcUERNWQMonVmBdhpN6AWNKVLe6Q52VqvYjdENwUfnT2gDFQqYR6TlW4uJMLXMM5iG4xTGJhyjAMEtCz5e-ApIqn80EhyBfgPd4XArI',
    engineTag: 'Supersonic Jet',
    likes: 3400,
    fireCount: 210,
    commentsCount: 1,
    category: 'Αεροπλάνα',
    contentText: 'Δοκιμές υπερηχητικής πτήσης. Ο σχεδιασμός της ατράκτου μειώνει την οπισθέλκουσα κατά 15% σε σχέση με την προηγούμενη γενιά. ✈️ #Aviation #Supersonic #FighterJet',
    commentsList: [
      {
        id: 'c3',
        username: 'Alex_Mech',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD-uU4NGzj_E67WdGyuC1iK-dZf-JfheSQC051fM8oeTbj0ugPXnlIGmrKP0EGAp3ck1Y-Ur86m-psk9qY41607o4DtXMZ6TW8qFwDkYLZ5rEzQ7gpPGtGg_-sGHJbXHpD6vfHSq7HyogzRIHd8HmnZ7Hv4SpL6gAVMDjJD_vMwVg4SfwHtOKqk7OvKF6ojdcsqhA62j24Q2i2M4jni7CN71J7ybmjG4i1MYBMxCyFvIUmtX8_qkklbKi1J0jwkAvVK06A9buIjgew',
        timeAgo: 'Πριν 3 ώρες',
        text: 'Αυτά τα πτερύγια ελέγχου είναι κατασκευασμένα από κράμα τιτανίου-αλουμινίου;'
      }
    ]
  }
];

export const INITIAL_DISCOVERIES: Discovery[] = [
  {
    id: 'disc-1',
    category: 'Αεροναυπηγική',
    title: 'Next-Gen Thrust Vectoring Systems Explained',
    description: 'Μια σε βάθος ανάλυση της λειτουργίας των ακροφυσίων μεταβλητής κατεύθυνσης ώσης που χρησιμοποιούνται στα σύγχρονα μαχητικά stealth.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCcEN8GowAqesbbDsa3UNNHL2gFnCbA45jvSZ2XkhUYO5bmlQ7Dl6yOe28dAXRFrAR_MimO6eG1jpjeMCMc74KdrKaSXCgWjzHorIjdSADfb1nWlc85jsUj31i8wcqQepqySoh80SgTYDnsvy-8SurKQH4PAVserhASq6WdpntbSZ8LNDvdvO-1rLgFUM1ZkAVvlUel9S9_AP7pUzG5YsBYCSESsKm_997VJnYsLRWGj8Wku1OhTJjet5AGBlmlofBl5nX57SFHwJU',
    likesCount: 4092,
    tag: '#Aerodynamics'
  },
  {
    id: 'disc-2',
    category: 'Αυτοκινητοβιομηχανία',
    title: 'Titanium Control Arms: Stress Testing',
    description: 'Μακροφωτογραφία εξαρτημάτων ανάρτησης τιτανίου υψηλής ακρίβειας υπό ακραία φορτία καταπόνησης.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD07JeGXDCXQK_v0DuI_OlMMz4qyDAaerbFSTT1N6bgXwjFiY5GKLpY2rmQh40pAFD9WTQFhdKv1GABylg7IBAu6sbX29ErPfFHPb80974QMd6PvGAcR1vwzEzYvVfucK_9Y1g42qPhunCAz3wmx2rByDVKP6SV4dkvHmcivHRBstlM5LWuU9yBWz5Rz6XE5i-Ofq2tG4Sy1j8YaPguECfHHWnrezMPeAlfDPOMrmkxwDlgSER8q_sebDUkX8ABG-vlNLwjJsVj8hc',
    likesCount: 1540,
    tag: '#CNC_Machining'
  },
  {
    id: 'disc-3',
    category: 'Ηλεκτροκίνηση',
    title: 'EV Conversion Basics & Thermals',
    description: 'Διαχείριση των θερμικών φορτίων σε συστοιχίες μπαταριών υψηλής τάσης κατά τη μετατροπή κλασικών οχημάτων.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC5pmwH0b_FbDdiQZggM8T-sRsn_DeSy7hPq7lCjTugywwWnPKtMOUX3KGu2XAXhuAdGFYhjDTnJgIb-Lx_aQljMMA3v4CC2MFXN9NJ0sPXgbm-_Sg1mSfrBvMsx7tKJ5Rvc-1Ox2BlbFFqvmxr51CJGx1_IYoKom1j4iVTweSKT0t-6NHjNws35qsEKw1o-oJdA-N_gZoMa1LxdKzQjdMziyEUlwOrbVsCi0yveKDiWLi6TOk0y_r0pk3AjuZ0-Pd-fC2udsrKb4c',
    likesCount: 2405,
    tag: '#EV_Conversion'
  }
];

export const INITIAL_MEETS: Meet[] = [
  {
    id: 'meet-1',
    category: 'Αυτοκίνητα',
    title: 'V8 Engine Tuning Workshop',
    date: 'Σάββατο, 14 Οκτωβρίου',
    time: '10:00 π.μ.',
    location: 'Detroit Metro Garage Sector 7 (Online Streaming διαθέσιμο)',
    attendeesCount: 15,
    detailImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDrWt_z59ebBD4CoytqJGEMBL1-pK2Salr5_K1wnQfwXqKG4hJci60TRt4xQQl-2xlcVhQa-aTPrjTmyMAp3s8jJgml9Xos2CeDdTGdj9fGMDDO-jY6SL3elHhFJOfmTPZ0qINmsPxPXnTK-QQLbiUYAD1rHoqCmiNKZNM4G2HWULRNmReYdsmSwmKZJn6kLnzCTBA_ip_JpJix5P8EZNEoUmRC9M_wmE8H6oAvtc2ys2KX-DgQebZf1Fz6plpByJGkNknpcPXl-gI',
    attendeesAvatars: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD-uU4NGzj_E67WdGyuC1iK-dZf-JfheSQC051fM8oeTbj0ugPXnlIGmrKP0EGAp3ck1Y-Ur86m-psk9qY41607o4DtXMZ6TW8qFwDkYLZ5rEzQ7gpPGtGg_-sGHJbXHpD6vfHSq7HyogzRIHd8HmnZ7Hv4SpL6gAVMDjJD_vMwVg4SfwHtOKqk7OvKF6ojdcsqhA62j24Q2i2M4jni7CN71J7ybmjG4i1MYBMxCyFvIUmtX8_qkklbKi1J0jwkAvVK06A9buIjgew',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBVufzs93w5_9c3QXsuzVKyrlQYS8RgTYXTFknIvCTrWV1q07BDTNiq2HJZCyV1GHPubEoUxjH1inhSe2DeIo9nXiECNdbej-EavDvwboaRX2QWSZCOA0az-b27yjNVfHfmNAmPS_8q5xwEtkBxQuPghHR6mb0GAUbLbc4wB8Ld9MB4flrN8t-lrjqCVcgDJ6T4eoFP1NoN3WpVBEqVx-6IBnstInr8Kh_U5zUt0uMbWg2BF7LajtPwCbIf9B1UoAbzE2e9-BHfFi4'
    ]
  },
  {
    id: 'meet-2',
    category: 'Αεροδιαστημική',
    title: 'Drone Aerodynamics Deep Dive',
    date: 'Κυριακή, 15 Οκτωβρίου',
    time: '2:00 μ.μ.',
    location: 'Seattle Airfield Hub / Εργαστήριο Αεροδυναμικής',
    attendeesCount: 8,
    detailImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAblMSLW3fWTvYzXyksa69oR00pGJU6Thgh6F6yh8rH24gFkh6zrRtD3Nr0COCDlUsmQPlmzqW5vMXs-7nAeVNxnEKfVzUNDjeGNDYXiJvVhaet0mjLUzW1-b1FfChZAkYkrZAPt95OqupiYoDT_ocP62YSvZdxUlVnmgwJY_lVZ28llwLiP72PnPEaV42HkP8CaDlxVhK-V1TtdyPDra-y9nHOitoIsd_5QvOOtW5GbIBJ9fkD133ZweOax4d7_XYoPpC-GaT9fms',
    attendeesAvatars: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBVufzs93w5_9c3QXsuzVKyrlQYS8RgTYXTFknIvCTrWV1q07BDTNiq2HJZCyV1GHPubEoUxjH1inhSe2DeIo9nXiECNdbej-EavDvwboaRX2QWSZCOA0az-b27yjNVfHfmNAmPS_8q5xwEtkBxQuPghHR6mb0GAUbLbc4wB8Ld9MB4flrN8t-lrjqCVcgDJ6T4eoFP1NoN3WpVBEqVx-6IBnstInr8Kh_U5zUt0uMbWg2BF7LajtPwCbIf9B1UoAbzE2e9-BHfFi4',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDa1FDxt53YfmvePiBufpeDPyXMq7dhjR9M46N9bRKTTvq6StloRvBjKkaZheHSYFiMw89U8Uuv4EppFhLOCOxGqRAbIw2JQ23i3-fD0Yh4cgT_5BxUmb97MK0CNyCoPUsBWlduixfdr2MmiROMXhHuQ7Ffxt5lVZFLOENjzLy2Zbo_pC5PLHYbM45Db9_OX-rmWcgmxBMz8-JTA8js9kWvUgo3D-Dqr8uVrg_62-xiHYakkKGH8xtGv6wwGaxg26rz1hAoTMoxdwY'
    ]
  }
];

export const INITIAL_COURSES: Course[] = [
  {
    id: 'course-1',
    title: 'Αεροδυναμική Μαχητικών Αεροσκαφών',
    instructor: 'Δρ. Αλέξανδρος Γεωργίου',
    isVIP: true,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCEctSc3UQyfccHRr1U9tQjp1Vc-eqSTcx5hFabo9zIlwmqagDssv0dNnZFWJx6603uP-RG1cRD4rF_PPPeRD3v0ZKFQwZPUeKBBqGqYAW84UYqV6VZH4GyfLj7geB8X4Z2YUyxnIFRE48_oZOCNszADl79yXxKKkFla82gqw2rm41jg5ml6l8h4LOEsMaYY5BrEwXK8QKMqqafIRMIC6Vw0IUgk_XItVnCKRhbc4TJJ2kIxQ8ErFgA3CIIl-4hx33hmZNVC9YxoPE',
    category: 'Φυσική της Κίνησης'
  },
  {
    id: 'course-2',
    title: 'Θερμοδυναμική Κινητήρων Εσωτερικής Καύσης',
    instructor: 'Μαρία Παππά',
    isVIP: false,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAVDkmLWoUlSQclwKrct9AlO3-fk7xhDeEil4iV9JugWnuYbBd0R3Fr8sYzrC0ixdehKVDtLbeTi3vBpo4b0PgUnN3VisVWqlz6_AysfdxZYuX4ecNd4A3HMmjWklNDx6aRB2N1wpU9Rq0j1jVYJZs-vGOAUnGqt-SJCop35LRw_o57NBe0pKLGeTtdz32zlSXlGFbh5-BfbFJ3ewWatPckaMrJgLy2HDz6DNsV2IwwaSxghDwYORO8EG2UwzFBUfnNwA3WWxCzfRE',
    category: 'Μηχανολογία'
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    type: 'like',
    title: 'Sky_Engineer',
    message: 'έκανε like στην ανάρτησή σου: "Βελτιστοποίηση της σχέσης ώθησης στροβίλου"',
    timeAgo: 'Πριν 2 λεπτά',
    isUnread: true,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBVufzs93w5_9c3QXsuzVKyrlQYS8RgTYXTFknIvCTrWV1q07BDTNiq2HJZCyV1GHPubEoUxjH1inhSe2DeIo9nXiECNdbej-EavDvwboaRX2QWSZCOA0az-b27yjNVfHfmNAmPS_8q5xwEtkBxQuPghHR6mb0GAUbLbc4wB8Ld9MB4flrN8t-lrjqCVcgDJ6T4eoFP1NoN3WpVBEqVx-6IBnstInr8Kh_U5zUt0uMbWg2BF7LajtPwCbIf9B1UoAbzE2e9-BHfFi4'
  },
  {
    id: 'notif-2',
    type: 'meet',
    title: 'Meet Request: Athens Track Day',
    message: 'Πρόσκληση για δοκιμές στην Πίστα των Αθηνών (Athens Circuit - Sector 4)',
    timeAgo: 'Χθες',
    isUnread: true,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAmN9T3vSgs7ntCopcF_O4hSilwLOs4nz2apWpvLvzycZu1FT_H5mCBUJAMDpODu7_pS1UcpEI24wr7q9FEgXtrwG9G1ACv_X9gFwccprrppudeKAk8bOJRj5ItWQqNUT8P2oq1atsGafYXAy9s54OLKTTpVSLv9AdU2xjonY4UW5W0paXHJEftwgTwYBjoCHpIptsfc7BZAcjOX2GWxYerg_ghuvl4SH6CDT7WzOBbWw0w-ixnLg7l6-5g7zvZc53zCyjCtdHgWvk',
    metadata: {
      showAcceptDecline: true,
      status: 'pending'
    }
  },
  {
    id: 'notif-3',
    type: 'course',
    title: 'Νέο VIP Μάθημα',
    message: 'Το μάθημα "Fluid Dynamics 101" είναι πλέον διαθέσιμο για VIP μέλη!',
    timeAgo: 'Πριν 10 λεπτά',
    isUnread: true,
  },
  {
    id: 'notif-4',
    type: 'comment',
    title: 'MechHead88',
    message: 'σχολίασε στο blueprint του στροβίλου σου.',
    timeAgo: 'Πριν 1 ώρα',
    isUnread: false,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDa1FDxt53YfmvePiBufpeDPyXMq7dhjR9M46N9bRKTTvq6StloRvBjKkaZheHSYFiMw89U8Uuv4EppFhLOCOxGqRAbIw2JQ23i3-fD0Yh4cgT_5BxUmb97MK0CNyCoPUsBWlduixfdr2MmiROMXhHuQ7Ffxt5lVZFLOENjzLy2Zbo_pC5PLHYbM45Db9_OX-rmWcgmxBMz8-JTA8js9kWvUgo3D-Dqr8uVrg_62-xiHYakkKGH8xtGv6wwGaxg26rz1hAoTMoxdwY'
  },
  {
    id: 'notif-5',
    type: 'system',
    title: 'Υπενθύμιση Συνεδρίας',
    message: 'Το εργαστήριο "Advanced CAD Modeling" ξεκινά σε 1 ώρα.',
    timeAgo: 'Πριν 3 ώρες',
    isUnread: false,
  }
];
