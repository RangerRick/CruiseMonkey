#!/usr/bin/perl -w

use warnings;
use strict;

use LWP::Simple;
use HTML::TreeBuilder;
use Data::Dumper;
use JSON::PP;

my $tree = HTML::TreeBuilder->new();

my $content = get 'http://www.infernalsingalongmachine.com/docs/SongCatalogMobile.html';
$tree->parse_content($content);

#$tree->parse_file('SongCatalogMobile.html');

my $results = {};

my @dls = $tree->look_down('_tag', 'dl');


for my $dl (@dls) {
	for my $dt ($dl->look_down('_tag', 'dt')) {
		my $artist = $dt->as_trimmed_text();

		my $dd = $dt->right();
		for my $br ($dd->look_down('_tag', 'br')) {
			$br->replace_with('########');
		}
		my @songs;
		for my $song (split(/\#\#\#\#\#\#\#\#/, $dd->as_trimmed_text())) {
			$song =~ s/^\s*(.*?)\s*$/$1/;
			push(@songs, $song)
		}

		my $lc_artist = lc($artist);

		if (exists $results->{$lc_artist}) {
			push(@{$results->{$lc_artist}->{'songs'}}, @songs);
		} else {
			$results->{$lc_artist} = {
				display_name => $artist,
				songs => \@songs
			}
		}
	}
}

my $json_list = [];
for my $lc_artist (sort keys %$results) {
	push(@{$json_list}, {
		artist => $results->{$lc_artist}->{'display_name'},
		songs  => $results->{$lc_artist}->{'songs'}
	});
}

my $json = JSON::PP->new();
my $json_text = $json->encode($json_list);

print "Found " . scalar(@{$json_list}) . " entries...\n";
open (FILEOUT, '>www/scripts/cruisemonkey/karaoke-list.js') or die "Can't write to karaoke-list.js: $!\n";
print FILEOUT $json_text;
close (FILEOUT);
