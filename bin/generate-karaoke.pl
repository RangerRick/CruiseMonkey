#!/usr/bin/env perl -w

$|++;

use warnings;
use strict;
use utf8;

use Encode qw(decode encode);

use LWP::Simple;
use LWP::UserAgent;
use HTML::TreeBuilder;
use Data::Dumper;
use JSON::PP;
use Mime::Base64 ();

my $tree = HTML::TreeBuilder->new();

print "* getting Karaoke data... ";
my $content = get 'http://www.infernalsingalongmachine.com/docs/SongCatalogMobile.html';
$tree->parse_content($content);
print "done\n";

my $results = {};

print "* parsing Karaoke data... ";
my @dls = $tree->look_down('_tag', 'dl');

for my $dl (@dls) {
	for my $dt ($dl->look_down('_tag', 'dt')) {
		my $artist = $dt->as_trimmed_text();
		$artist = encode('UTF-8', $artist);

		my $dd = $dt->right();
		for my $br ($dd->look_down('_tag', 'br')) {
			$br->replace_with('########');
		}
		my @songs;
		for my $song (split(/\#\#\#\#\#\#\#\#/, $dd->as_trimmed_text())) {
			$song =~ s/^\s*(.*?)\s*$/$1/;
			$song = encode('UTF-8', $song);
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
print "done\n";

print "* Making karaoke list:\n";
my $json_list = [];
my $id = 1;
for my $lc_artist (sort keys %$results) {
	my $artist_name = $results->{$lc_artist}->{'display_name'};
	for my $song (sort { lc($a) cmp lc($b) } @{$results->{$lc_artist}->{'songs'}}) {
#		my $id = MIME::Base64::encode($artist_name . ':' . $song);
#		chomp($id);
#		$id =~ s/\=+$//;
		push(@{$json_list}, [$id++, $results->{$lc_artist}->{'display_name'}, $song]);
	}
}

my $json = JSON::PP->new();
my $json_text = $json->encode($json_list);

print "Found " . scalar(@{$json_list}) . " entries.  Writing them to disk... ";
open (FILEOUT, '>www/scripts/cruisemonkey/karaoke-list.js') or die "Can't write to karaoke-list.js: $!\n";
print FILEOUT $json_text;
close (FILEOUT);
print "done\n";
