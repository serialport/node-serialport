{
  'targets': [
    {
      'target_name': 'serialport',
      'sources': [
        'src/serialport.cpp',
      ],
      'conditions': [
        ['OS=="win"',
          {
            'sources': [
              "src/serialport_win.cpp",
              'src/win/disphelper.c',
              'src/win/enumser.cpp',
            ],
          }
        ],
        ['OS!="win"',
          {
            'sources': [
              'src/serialport_unix.cpp',
              'src/serialport_poller.cpp',
            ],
          }
        ],
      ],
    },
  ],
}
